# Generated by Django 5.1.2 on 2024-11-01 12:14

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0002_tag_post_audio_post_image_post_video_post_tags'),
    ]

    operations = [
        migrations.RenameField(
            model_name='tag',
            old_name='wikidata_id',
            new_name='qid',
        ),
    ]