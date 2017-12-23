function Node(data) {
    this.id = data.id;
    this.name = data.name;
    this.post = data.post;
    this.image = data.image;
    this.parentId = data.parent;

    this.parent = undefined; // Ссылка на родителя
    this.children = []; // Ссылки на детей

    this.totalChildrenCount = 0; // Общее количество подчиненных
}

function Tree(data) {
    this.dataReferences = {}; // Список всех элементов
    this.head = new Node({
        parent: undefined,
        id: undefined,
        name: 'Galactic Empire',
        post: 'Imperial military',
        image: 'empire.png'
    }); // Фиктивная голова
    this.recountChildrenCount = function () {
        // Формируем порядок обхода в глубину
        var order = [];
        var stack = [this.head];
        var blackVertices = {};

        while (stack.length > 0) {
            var vertex = stack.pop();

            if (blackVertices[vertex.id] !== true) {
                order.push(vertex);
                blackVertices[vertex.id] = true;

                vertex.children.forEach(function (child) {
                    stack.push(child);
                });
            }
        }

        while (order.length > 0) {
            var element = order.pop();
            if (element.parent !== undefined) {
                element.parent.totalChildrenCount += 1 + element.totalChildrenCount;
            }

        }
    };

    // Создаем элементы списка
    data.forEach(function (element) {
        this.dataReferences[element.id] = new Node(element);

    }, this);

    // Строим дерево
    for (var id in this.dataReferences) {
        var element = this.dataReferences[id];
        // Если нет родителя, делаем сыном фиктивной головы
        if (!element.hasOwnProperty('parent') || !element.parentId) {
            this.head.children.push(element);
            element.parent = this.head;
        }
        else {
            this.dataReferences[element.parentId].children.push(element);
            element.parent = this.dataReferences[element.parentId];
        }
    }

    // Считаем количество детей
    this.recountChildrenCount();

}

var tree = new Tree(data);


$(document).ready(function () {
    const avatarsPath = 'assets/avatars/';
    var currentNode = tree.head;

    var $backLink = $('#back-link');
    var $logoLink = $('#logo-link');
    var $personImage = $('#person-avatar');
    var $personName = $('#person-name');
    var $personPost = $('#person-post');
    var $arrowNavigation = $('#arrows-links').find('a');
    var $childrenList = $('#children-list');
    var $mainContainer = $('#main-container');
    var first_time = true;

    var childTemplate = $('#child-template').clone(true, true);
    childTemplate.removeAttr('id');
    $('#child-template').remove();

    var renderNode = function (node) {
        var clone = undefined;
        if (!first_time && currentNode !== node) {
            clone = $mainContainer.clone(true, true);

            clone.removeAttr('id');
            clone.css('opacity', 1).css('position', 'absolute').css('top', 0).css('left', 0).css('right', 0).css('z-index', 999);
            clone.prependTo('body');
            $mainContainer.css('opacity', 0);
        }


        if (node.parent === undefined) {
            $backLink.hide();
            $arrowNavigation.hide();
        }
        else {
            $backLink.show();
            $arrowNavigation.show();
        }

        $('title').text(node.name);
        $personImage.attr('src', avatarsPath + node.image);
        $personName.text(node.name);
        $personPost.text(node.post);

        // Отрисовка детей
        $childrenList.find('li').remove();
        node.children.forEach(function (child) {
            var template = childTemplate.clone();

            template.attr('data-id', child.id);
            template.find('h3').text(child.name);
            template.find('p').text(child.post);
            template.find('img').attr('src', avatarsPath + child.image);

            if (child.totalChildrenCount > 0) {
                template.find('span.badge').text(child.totalChildrenCount);
            }
            else {
                template.find('span.badge').remove();
            }

            template.appendTo($childrenList);

            template.find('a').click(function () {
                renderNode(tree.dataReferences[$(this).parent('li').attr('data-id')]);
                return false;
            });
        });

        if (!first_time && currentNode !== node) {
            clone.stop().fadeTo(700, 0);
            $mainContainer.stop().fadeTo(700, 1, function () {
                clone.remove();
            });

        }
        else {
            first_time = false;
        }
        // Установка текущей ноды
        currentNode = node;
    };

    var getNeighbor = function (node, offset) {
        if (node.parent === undefined) {
            return undefined;
        }

        var parent = node.parent;
        var index = parent.children.indexOf(node);

        if (index + offset >= parent.children.length) {
            return parent.children[(index + offset) % parent.children.length];
        }

        if (index + offset < 0) {
            index = parent.children.length - (Math.abs(index + offset) % parent.children.length);
            return parent.children[index];
        }

        return parent.children[index + offset];
    };

    renderNode(currentNode);

    // Отображение страницы
    $mainContainer.fadeTo(1000, 1);

    // Клик по кнопке назад
    $backLink.click(function () {
        renderNode(currentNode.parent);
    });

    // Клик по логотипу
    $logoLink.click(function () {
        renderNode(tree.head);
        return false;
    });

    // Клик по стрелкам
    $('#left-arrow').click(function () {
        renderNode(getNeighbor(currentNode, -1));
        return false;
    });

    $('#right-arrow').click(function () {
        renderNode(getNeighbor(currentNode, 1));
        return false;
    });
});
