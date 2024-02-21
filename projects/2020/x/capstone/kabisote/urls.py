
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"), 
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("add", views.add, name="add"),
    path("edit-details/<int:id>", views.editdetails, name="editdetails"),
    path("edit/<int:id>", views.edit, name="edit"),
    path("delete/<int:id>", views.delete, name="delete"),
    path("j/<slug:type>/<int:id>", views.apiwid , name="apiwid"),
    path("j/<slug:type>", views.api , name="api"),
    path("qe", views.questionsapi, name="questionsapi"),
    path("quizzes/<slug:type>", views.routes,name="routes" ),
    path("quizzes/<slug:type>/<int:id>", views.routesnid,name="routesnid" ),
    path("quiz/<int:id>", views.quiz, name="quiz"),
    path("tf/<int:isfollowing>/<int:id>", views.tf, name="togglefollow"),
    path("tb/<slug:bookmarked>/<int:id>", views.tb, name="togglebookmark"),
    path("checkanswers", views.checkanswers, name="checkanswers"),
    path("deleteq", views.deletequestion, name="deletequestion"),
    path("reorder", views.reorder, name="reorder"),
    path("random", views.randomize, name="random"),
    path("error-404",views.error404, name="error-404")
]
