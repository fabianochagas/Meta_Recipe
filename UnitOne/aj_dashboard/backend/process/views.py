from django.shortcuts import render
 
from .serializers import ProcessSerilizer,ProcessCreateSerilizer
from django.http import Http404
from rest_framework import generics, mixins, viewsets
from .models import Process
# Create your views here.
#5.1 mixins list
from rest_framework.response import Response
from rest_framework import permissions, status
import json
import pandas as pd

class Process_list(mixins.ListModelMixin,mixins.CreateModelMixin,generics.GenericAPIView):
    queryset = Process.objects.all()
    serializer_class = None 

    def get(self, request):
        """ self.serializer_class = ProcessSerilizer
        return self.list(request) """
        queryset = Process.objects.all()
        paginator = self.pagination_class()
        """ result_page = paginator.paginate_queryset(queryset, request) """
        serializer = ProcessCreateSerilizer(queryset, many=True)
        return Response(
                {'status': 'success', 'code': status.HTTP_200_OK, 'message': 'success', 'payload': serializer.data},
                status=status.HTTP_200_OK)
    
    def post(self, request):
        """ self.serializer_class = ProcessCreateSerilizer
        return self.create(request) """
        print("sadddd")
        if "process" in request.FILES:
            for iF in request.FILES.getlist('process'):
                if iF.content_type == 'application/json':
                    iData = json.loads(iF.read())
                   
                    # print(ingredients_list)
                    for process in iData:
                        
                        try:
                            idict = {
                                "name":process['name'],
                                "process_type":process['process_type'],
                                "description":process['description'],
                                "parameters":process['parameters'],
                                "equipment_list":process['equipment_list'],
                                "optional_equipment_list":process['optional_equipment_list'],

                            }
                            serializer = ProcessCreateSerilizer(data=idict)
                            if serializer.is_valid():
                                serializer.save()
                        except Exception as e:
                            raise e
            return Response(
                {'status': 'success', 'code': status.HTTP_200_OK, 'message': 'success', 'payload': serializer.data},
                status=status.HTTP_200_OK)
        else:
            return Response(
                {'status': 'success', 'code': status.HTTP_200_OK, 'message': 'No Process', 'payload': {}},
                status=status.HTTP_200_OK)

#5.2 mixins get patch delete 
class Process_pk(mixins.RetrieveModelMixin, mixins.UpdateModelMixin, mixins.DestroyModelMixin, generics.GenericAPIView):
    queryset = Process.objects.all()
    serializer_class = ProcessSerilizer
    def get(self, request, pk):
        return self.retrieve(request)
    def patch(self, request, pk):
        self.serializer_class = ProcessCreateSerilizer
        return self.update(request)
    def delete(self, request, pk):
        return self.destroy(request)
