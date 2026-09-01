# Generated migration for Department unique constraints

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0003_seed_real_reference_data'),
    ]

    operations = [
        migrations.AlterField(
            model_name='department',
            name='name',
            field=models.CharField(max_length=100),
        ),
        migrations.AlterField(
            model_name='department',
            name='code',
            field=models.CharField(max_length=20),
        ),
        migrations.AlterUniqueTogether(
            name='department',
            unique_together={('campus', 'name'), ('campus', 'code')},
        ),
    ]
