from django.db import models


# Test model
class Question(models.Model):
    text = models.CharField(max_length=250)
