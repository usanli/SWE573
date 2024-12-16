from django.db import migrations
from cloudinary.models import CloudinaryField

class Migration(migrations.Migration):
    dependencies = [
        ('main', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='post',
            name='video',
            field=CloudinaryField(blank=True, max_length=255, null=True, verbose_name='video'),
        ),
        migrations.AlterField(
            model_name='post',
            name='audio',
            field=CloudinaryField(blank=True, max_length=255, null=True, resource_type='raw', verbose_name='audio'),
        ),
    ] 