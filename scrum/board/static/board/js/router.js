(function ($, Backbone, _, app) {

    var AppRouter = Backbone.Router.extend({
        routes: {
            '': 'home',
            'sprint/:id': 'sprint' 
        },
        initialize: function (options) {
            this.contentElement = '#content';
            this.current = null;
            this.header = new app.views.HeaderView();
            $('body').prepend(this.header.el);
            this.header.render();
            Backbone.history.start();
        },
        home: function () {
            var view = new app.views.HomepageView({el: this.contentElement});
            this.render(view);
        },
        sprint: function (id) {
            var view = new app.views.SprintView({
                el: this.contentElement,
                sprintId: id
            });
            this.render(view);
        },
        route: function (route, name, callback) {
            // Sobrepõe a rota padrão para obrigar o login em cada página
            var login;
            callback = callback || this[name];
            callback = _.wrap(callback, function (original) {
                var args = _.without(arguments, original);
                if (app.session.authenticated()) {
                    original.apply(this, args);
                } else {
                    // Mostra a tela de login antes de chamar a view
                    $(this.contentElement).hide();
                    // Liga o callback original uma vez que o login tenha sucesso
                    login = new app.views.LoginView();
                    $(this.contentElement).after(login.el);
                    login.on('done', function () {
                        this.header.render();
                        $(this.contentElement).show();
                        original.apply(this, args);
                    }, this);
                    // Renderiza o formulário de login
                    login.render();
                }
            });
            return Backbone.Router.prototype.route.apply(this, [route, name, callback]);
        },
        render: function (view) {
            if (this.current) {
                this.current.undelegateEvents();
                this.current.$el = $();
                this.current.remove();
            }
            this.current = view;
            this.current.render();
        }
    });
    
    app.router = AppRouter;

})(jQuery, Backbone, _, app);