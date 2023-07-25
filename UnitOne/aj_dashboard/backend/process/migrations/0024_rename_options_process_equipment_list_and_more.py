# Generated by Django 4.2.1 on 2023-07-25 11:59

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('process', '0023_alter_process_type'),
    ]

    operations = [
        migrations.RenameField(
            model_name='process',
            old_name='options',
            new_name='equipment_list',
        ),
        migrations.RemoveField(
            model_name='process',
            name='type',
        ),
        migrations.AddField(
            model_name='process',
            name='description',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='process',
            name='optional_equipment_list',
            field=models.JSONField(null=True),
        ),
        migrations.AddField(
            model_name='process',
            name='parameters',
            field=models.JSONField(null=True),
        ),
        migrations.AddField(
            model_name='process',
            name='process_type',
            field=models.CharField(blank=True, max_length=50, null=True),
        ),
    ]
