# Generated by Django 3.0.7 on 2020-07-19 15:28

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('recipes', '0012_auto_20200719_1824'),
    ]

    operations = [
        migrations.AlterField(
            model_name='singlerecipeingredient',
            name='value',
            field=models.FloatField(default=0.0),
        ),
    ]
