# Generated by Django 5.1.2 on 2024-11-01 12:15

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0003_rename_wikidata_id_tag_qid'),
    ]

    operations = [
        migrations.RenameField(
            model_name='tag',
            old_name='qid',
            new_name='wikidata_id',
        ),
    ]
