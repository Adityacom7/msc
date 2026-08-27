from django.db import models


class TaskEvent(models.Model):
    routing_key = models.CharField(max_length=50)
    task_id = models.IntegerField()
    title = models.CharField(max_length=255)
    username = models.CharField(max_length=150)
    received_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.routing_key} task={self.task_id} user={self.username}"
