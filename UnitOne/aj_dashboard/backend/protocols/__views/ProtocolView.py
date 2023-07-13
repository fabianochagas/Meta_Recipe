import json
import random
import string
from functools import reduce
from operator import or_

import jsonpickle
from django.core import serializers
from django.core.serializers import serialize
from django.db import transaction, models
from django.db.models import Q, Count
from django.forms import model_to_dict
from django.http import JsonResponse, HttpResponse
from rest_framework import status
from rest_framework.decorators import action, api_view
from rest_framework.exceptions import ValidationError
from rest_framework.generics import GenericAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ViewSet, GenericViewSet
from rest_framework_simplejwt.authentication import JWTAuthentication

from common.ml import ml_component
from common.utilities.Helper import generate_random_string
from common.utilities.Pagination import CustomPagination
from ingredients.models import Ingredients
from ingredients.serializers import IngredientsSerilizer
from meta_recipe.models import MetaRecipe
from process.models import Process
from projects.models import Projects
from protocols.__serializers.ProtocolSerializer import ProtocolSerializer
from protocols.models import Protocol, ProtocolNode, ProtocolEdge, ProtocolIngredient, ProtocolProcess, \
    ProtocolSensoryPanel
from recipe.__views import RecipeFlowView
from recipe.models import Recipe, RecipeIngredients
from sensory_panels.models import AbstractSensoryPanel


class ProtocolView(GenericViewSet):
    authentication_classes = (JWTAuthentication,)
    permission_classes = (IsAuthenticated,)
    serializer_class = ProtocolSerializer
    pagination_class = CustomPagination
    ordering = '-updated_at'

    queryset = Protocol.objects.all()

    def create(self, request):
        result = {}
        flow = {}
        if request.FILES.get('file'):
            data = json.loads(request.FILES.get('file').read())
            serializer = ProtocolSerializer(data=data)
            serializer.is_valid(raise_exception=True)
            obj = serializer.save()
            if 'flow' in data:
                result = self.create_flow(flow=data['flow'], protocol_id=obj.id)
        else:
            data = request.data
            del data['aroma_intensity'], data['taste_intensity']
            if 'name' not in data:
                data['name'] = 'Protocol-0'
                if Protocol.objects.filter().count():
                    last_id = Protocol.objects.latest('id')
                    if last_id:
                        data['name'] = f"Protocol-{last_id.id + 1}"
            serializer = self.get_serializer(data=data)
            serializer.is_valid(raise_exception=True)
            obj = serializer.save()
            try:
                last_id = MetaRecipe.objects.latest('id')
                meta_name = f"Meta-{last_id.id + 1}"
            except MetaRecipe.DoesNotExist:
                meta_name = 'Meta-0'
            obj.protocol_meta_recipes.create(name=meta_name)

            if 'custom_sensory_panels' in data:
                for panel in data['custom_sensory_panels']:
                    ProtocolSensoryPanel.objects.filter(id=panel['id']).update(value=panel['value'])

            if obj.project_id:
                project = Projects.objects.get(id=obj.project_id)
                project_sensory_panels = project.sensory_panels.all()
                if len(list(project_sensory_panels)):
                    for panel in project_sensory_panels:
                        obj.custom_sensory_panels.create(
                            variable=panel.panel_variable,
                            value=panel.panel_value)

            if 'flow' in request.data:
                flow = request.data['flow']

            result = self.create_flow(flow=flow, protocol_id=obj.id)
        return Response(
            {'status': 'success', 'code': status.HTTP_200_OK, 'message': 'success', 'payload': result},
            status=status.HTTP_200_OK)

    def update(self, request, pk, *args, **kwargs):
        # protocol = Protocol.objects.get(id=pk)
        result = {}
        protocol = Protocol.objects.annotate(num_protocol_meta_recipes=models.Count('protocol_meta_recipes')).get(id=pk)
        is_draft = True if 'is_draft' in request.data else False
        is_draft = request.data['is_draft'] if is_draft else False

        if 'custom_sensory_panels' in request.data:
            for panel in request.data['custom_sensory_panels']:
                ProtocolSensoryPanel.objects.filter(id=panel['id']).update(value=panel['value'])

        if not protocol.num_protocol_meta_recipes or is_draft:
            serializer = ProtocolSerializer(instance=protocol, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            obj = serializer.save()
            obj.protocol_processes.all().delete()
            obj.protocol_nodes.all().delete()
            obj.protocol_ingredient.all().delete()
            result = self.create_flow(flow=request.data['flow'], protocol_id=obj.id)
        else:
            try:
                last_id = Recipe.objects.latest('id')
                recipe_name = f"Recipe-{last_id.id + 1}"
            except Recipe.DoesNotExist:
                recipe_name = 'Recipe-0'

            try:
                last_id = MetaRecipe.objects.latest('id')
                meta_name = f"Meta-{last_id.id + 1}"
            except MetaRecipe.DoesNotExist:
                meta_name = 'Meta-0'

            meta = protocol.protocol_meta_recipes.get()

            if not meta:
                meta = protocol.protocol_meta_recipes.create(name=meta_name)

            recipe = meta.recipes_for_meta.create(name=recipe_name, protocol=protocol)
            recipe_flow = RecipeFlowView
            recipe_flow.create_recipe_flow(flow=request.data['flow'], recipe_id=recipe.id)
        return Response(
            {'status': 'success', 'code': status.HTTP_200_OK, 'message': 'success', 'payload': result},
            status=status.HTTP_200_OK)

    def list(self, request):
        queryset = Protocol.objects.all().order_by('-updated_at')
        paginator = self.pagination_class()
        result_page = paginator.paginate_queryset(queryset, request)
        serializer = ProtocolSerializer(result_page, many=True)

        return paginator.get_paginated_response(serializer.data)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        if not instance.custom_sensory_panels.count():
            panels = AbstractSensoryPanel.objects.only('name')
            for panel in panels:
                instance.custom_sensory_panels.create(variable=panel.name)
        serializer = ProtocolSerializer(instance)
        return Response({
            'status': 'success', 'code': status.HTTP_400_BAD_REQUEST, 'message': 'success',
            'payload': serializer.data,
        }, status=status.HTTP_200_OK)

    def destroy(self, request, pk, *args, **kwargs):
        protocol = Protocol.objects.get(id=pk)
        protocol.delete()
        return Response(
            {'status': 'success', 'code': status.HTTP_200_OK, 'message': 'Protocol deleted!', 'payload': {}},
            status=status.HTTP_200_OK
        )

    @action(detail=False, methods=['POST'])
    @transaction.atomic
    def create_flow(self, flow, protocol_id=None, *args, **kwargs):
        try:
            with transaction.atomic():
                protocol = Protocol.objects.get(id=protocol_id)
                protocol.flow = flow
                protocol.save()
                protocol.protocol_processes.all().delete()
                protocol.protocol_nodes.all().delete()
                protocol.protocol_ingredient.all().delete()
                protocol.refresh_from_db()
                nodes = {}
                if 'nodes' in flow:
                    for node in flow['nodes']:
                        if node['type'] == 'ingredient-container':
                            for child in node['data']['children']:
                                ing_name = child['data']['value']['name']
                                ing_amount = child['data']['value']['amount']
                                ing_unit = 'g'
                                obj, created = Ingredients.objects.get_or_create(
                                    name=ing_name
                                )
                                protocol_ingredient = ProtocolIngredient.objects.create(protocol=protocol,
                                                                                        ingredient=obj,
                                                                                        unit=ing_unit,
                                                                                        quantity=ing_amount)
                                protocol_node = ProtocolNode.objects.create(protocol=protocol,
                                                                            model_type='ProtocolIngredient',
                                                                            model_id=protocol_ingredient.id,
                                                                            container=node['id'],
                                                                            slug=child['id'],
                                                                            type='ingredient',
                                                                            payload=child['data'])
                                nodes[child['id']] = protocol_node.id
                        elif node['type'] == 'process':
                            for child in node['data']['children']:
                                process = Process.objects.get(name__iexact=node['data']['label'])
                                protocol_process = ProtocolProcess.objects.create(protocol=protocol,
                                                                                  process=process,
                                                                                  arguments=child['data'],
                                                                                  value=child['data']['value']
                                                                                  )
                                protocol_node = ProtocolNode.objects.create(protocol=protocol,
                                                                            model_type='ProtocolProcess',
                                                                            model_id=protocol_process.id,
                                                                            container=node['id'],
                                                                            slug=child['id'],
                                                                            type='process',
                                                                            payload=child['data'])
                                nodes[child['id']] = protocol_node.id
                        elif node['type'] in ['merge', 'serve']:
                            protocol_node = ProtocolNode.objects.create(protocol=protocol,
                                                                        container=node['id'],
                                                                        slug=node['id'],
                                                                        type=node['type'])
                            nodes[node['id']] = protocol_node.id

                if 'edges' in flow:
                    for edge in flow['edges']:
                        source_id = nodes[edge['sourceHandle'].replace('-source', '')]
                        target_id = nodes[edge['targetHandle'].replace('-target', '')]
                        ProtocolEdge.objects.create(source_node_id=source_id, target_node_id=target_id)
                return ProtocolSerializer(protocol).data
        except Exception as e:
            raise e

    @action(detail=False, methods=['POST'], name='clone')
    def clone(self, request, *args, **kwargs):
        ids = request.data['ids']
        result = Protocol.objects.filter(
            reduce(or_, [Q(id=n) for n in ids])
        ).count() == len(ids)
        if not result:
            raise ValidationError("At least one ID is not in DB")

        count = Protocol.objects.filter().count()

        for id in ids:
            count = count + 1
            protocol = Protocol.objects.get(id=id)
            protocol.pk = None
            protocol.name = f"{protocol.name}_clone_{count}"
            protocol.save()
            self.create_flow(flow=protocol.flow, protocol_id=protocol.id)

        return Response(
            {'status': 'success', 'code': status.HTTP_200_OK, 'message': 'success', 'payload': {}},
            status=status.HTTP_200_OK)

    @action(detail=True, methods=['POST'])
    @transaction.atomic
    def adjustments(self, request, pk=None, *args, **kwargs):
        try:
            with transaction.atomic():
                protocol = Protocol.objects.get(id=pk)
                __protocol = ProtocolSerializer(protocol).data
                if not len(__protocol['custom_sensory_panels']):
                    panels = AbstractSensoryPanel.objects.only('name')
                    for panel in panels:
                        protocol.custom_sensory_panels.create(variable=panel.name)
                saved_ingredients = []
                changed_ingredients = []
                saved_panels = []
                changed_panels = []
                changed_flow = request.data.get('flow', {})
                for ing in __protocol['protocol_ingredient']:
                    saved_ingredients.append(
                        {'name': ing['ingredient_name'], 'quantity': ing['quantity'], 'unit': ing['unit']})
                for panel in __protocol['custom_sensory_panels']:
                    saved_panels.append({'variable': panel['variable'], 'value': panel['value']})

                if 'nodes' in changed_flow:
                    for node in changed_flow['nodes']:
                        if node['type'] == 'ingredient-container':
                            for child in node['data']['children']:
                                ing_name = child['data']['value']['name']
                                ing_amount = child['data']['value']['amount']
                                ing_unit = 'g'
                                changed_ingredients.append(
                                    {'name': ing_name, 'quantity': float(ing_amount), 'unit': ing_unit})
                # ingredient_container = filter(lambda ic: ic['type'] == 'ingredient-container', protocol.flow['nodes'])
                # print(list(ingredient_container))
                saved = {
                    'ingredients': saved_ingredients,
                    'sensory_panel': saved_panels
                }
                sensors = request.data.get('sensors', [])
                changed_panels = [dict((k, d.get(k, None)) for k in ['variable', 'value']) for d in sensors]
                changed = {
                    'ingredients': changed_ingredients,
                    'sensory_panel': changed_panels
                }
                ml = ml_component
                result = ml.predict(saved_state=saved, changed_state=changed)
                flow = request.data.get('flow', {})
                if 'nodes' in flow:
                    for node in flow['nodes']:
                        if node['type'] == 'ingredient-container':
                            for child in node['data']['children']:
                                ing_dict = next(item for item in result['ingredients'] if
                                                item["name"] == child['data']['value']['name'])
                                child['data']['value']['amount'] = ing_dict['quantity']
                    __protocol = self.create_flow(flow=flow, protocol_id=pk)
                for panel in result['sensory_panel']:
                    ProtocolSensoryPanel.objects.filter(protocol=protocol, variable=panel['variable']).update(
                        value=panel['value'])
                return Response(
                    {'status': 'success', 'code': status.HTTP_200_OK, 'message': 'success',
                     'payload': __protocol},
                    status=status.HTTP_200_OK)
        except Exception as e:
            raise e

    @action(detail=False, methods=['POST'])
    def bulk_destroy(self, request):
        ids = request.data.get('ids', [])
        self.queryset.filter(id__in=ids).delete()
        return Response(
            {'status': 'success', 'code': status.HTTP_200_OK, 'message': 'Protocols deleted!', 'payload': {}},
            status=status.HTTP_200_OK
        )

    @action(detail=False, methods=['GET'])
    def test(self, request):
        ml = ml_component
        # saved = {
        #     "ingredients": [
        #         {"name": "water", "quantity": 250, "unit": "g"},
        #         {"name": "sugar", "quantity": 250, "unit": "g"},
        #         {"name": "milk", "quantity": 250, "unit": "g"}],
        #     "sensory_panel": [
        #         {"variable": "Fruity", "value": 9.5},
        #         {"variable": "Cacao / Chocolate", "value": 1.5},
        #         {"variable": "Soft", "value": 7.5},
        #         {"variable": "Salty", "value": 2.0},
        #         {"variable": "Hard", "value": 4.0},
        #         {"variable": "Nutty", "value": 1.5},
        #         {"variable": "Cereal", "value": 1.0},
        #         {"variable": "Fatty", "value": 0.5},
        #         {"variable": "Sticky", "value": 6.5},
        #         {"variable": "Dry", "value": 0.5},
        #         {"variable": "Crunchy", "value": 2.5},
        #         {"variable": "Sweet", "value": 8.5}]
        # }

        saved = {
            "ingredients": [
                {"name": "frozen strawberries", "quantity": 250, "unit": "g"},
                {"name": "frozen blueberries", "quantity": 250, "unit": "g"},
                {"name": "frozen raspberries", "quantity": 250, "unit": "g"},
                {"name": "milk", "quantity": 250, "unit": "g"},
                {"name": "honey", "quantity": 15, "unit": "g"},
                {"name": "banana", "quantity": 250, "unit": "g"}],
            "sensory_panel": [
                {"variable": "Fruity", "value": 9.5},
                {"variable": "Cacao / Chocolate", "value": 1.5},
                {"variable": "Soft", "value": 7.5},
                {"variable": "Salty", "value": 2.0},
                {"variable": "Hard", "value": 4.0},
                {"variable": "Nutty", "value": 1.5},
                {"variable": "Cereal", "value": 1.0},
                {"variable": "Fatty", "value": 0.5},
                {"variable": "Sticky", "value": 6.5},
                {"variable": "Dry", "value": 0.5},
                {"variable": "Crunchy", "value": 2.5},
                {"variable": "Sweet", "value": 8.5}]
        }

        changed = {
            "ingredients": [
                {"name": "frozen strawberries", "quantity": 250, "unit": "g"},
                {"name": "frozen blueberries", "quantity": 250, "unit": "g"},
                {"name": "walnuts", "quantity": 50, "unit": "g"},
                {"name": "milk", "quantity": 250, "unit": "g"},
                {"name": "honey", "quantity": 115, "unit": "g"},
                {"name": "banana", "quantity": 250, "unit": "g"}],
            "sensory_panel": [
                {"variable": "Fruity", "value": 0},
                {"variable": "Cacao / Chocolate", "value": 0},
                {"variable": "Soft", "value": 0},
                {"variable": "Salty", "value": 0},
                {"variable": "Hard", "value": 0},
                {"variable": "Nutty", "value": 0},
                {"variable": "Cereal", "value": 0},
                {"variable": "Fatty", "value": 0},
                {"variable": "Sticky", "value": 0},
                {"variable": "Dry", "value": 0.5},
                {"variable": "Crunchy", "value": 0},
                {"variable": "Sweet", "value": 0}]
        }

        # changed = {
        #     "ingredients": [
        #         {"name": "water", "quantity": 250, "unit": "g"},
        #         {"name": "sugar", "quantity": 33, "unit": "g"},
        #         {"name": "milk", "quantity": 250, "unit": "g"}],
        #     "sensory_panel": [
        #         {"variable": "Fruity", "value": 9.5},
        #         {"variable": "Cacao / Chocolate", "value": 1.5},
        #         {"variable": "Soft", "value": 7.5},
        #         {"variable": "Salty", "value": 2.0},
        #         {"variable": "Hard", "value": 4.0},
        #         {"variable": "Nutty", "value": 1.5},
        #         {"variable": "Cereal", "value": 1.0},
        #         {"variable": "Fatty", "value": 4.5},
        #         {"variable": "Sticky", "value": 6.5},
        #         {"variable": "Dry", "value": 0.5},
        #         {"variable": "Crunchy", "value": 2.5},
        #         {"variable": "Sweet", "value": 8.5}]
        # }
        result = ml.predict(saved_state=saved, changed_state=changed)
        return Response(result)

    @action(detail=True, methods=['GET'], url_path='similar')
    def get_similar_protocols(self, request, pk=None):
        protocol = Protocol.objects.get(id=pk)
        protocols = Protocol.objects.filter(project_id=protocol.project_id)
        return Response(
            {'status': 'success', 'code': status.HTTP_200_OK, 'message': 'success', 'payload': ProtocolSerializer(protocols, many=True).data},
            status=status.HTTP_200_OK
        )
