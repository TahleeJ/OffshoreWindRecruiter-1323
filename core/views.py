from django.shortcuts import render
from django.http import JsonResponse

from core.models import Question


def index(request):
    # Gets all question entries from DB
    question_list = Question.objects.all()
    context = {'question_list': question_list}
    
    # Renders core\templates\survey\index.html
    return render(request, 'survey/index.html', context)


def static_test(request):   
    return render(request, 'static_test.html')
    

def api_test(request):
    data = list(Question.objects.all().values())
    return JsonResponse(data, safe=False)