from django.db.models import Count
from django.http import JsonResponse

from .models import TaskEvent


def health(request):
    return JsonResponse({"status": "ok"})


def summary(request):
    by_event_type = list(
        TaskEvent.objects.values("routing_key").annotate(count=Count("id")).order_by("routing_key")
    )
    by_user = list(
        TaskEvent.objects.values("username").annotate(count=Count("id")).order_by("-count")
    )
    return JsonResponse(
        {
            "total_events": TaskEvent.objects.count(),
            "by_event_type": by_event_type,
            "by_user": by_user,
        }
    )
