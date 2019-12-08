import { EventEmitter, eventBus } from './../../helpers/eventEmitter';
import { uuid } from './../../helpers/uuid';

class ListModel extends EventEmitter {
    constructor(items = []) {
        super();
        this.items = items;
    }

    findIndexById(id) {
        return this.items.findIndex(item => item.id === id);
    }

    findItemById(id) {
        return this.items.find(item => item.id === id);
    }

    addItem(item) {
        const newItem = { ...item, id: uuid() };

        this.items.push(newItem);
        this.emit('itemAdded', { item: newItem })
    }

    removeItem({ id }) {
        const indexToRemove = this.findIndexById(id);

        this.items.splice(indexToRemove, 1);
        this.emit('itemRemoved', { id });
    }

    editItem({ id, updatedProps }) {
        const index = this.findIndexById(id);
        this.items[index] = { ...this.items[index], ...updatedProps } 

        this.emit('itemChanged', { item: this.items[index] });
    }

    sortItemsBy({ field }) {
        this.items.sort((a, b) => a[field].localeCompare(b[field]));

        this.emit('itemsSorted', { item: this.items });
    }
}

class ListView extends EventEmitter {
    constructor(model, parent) {
        super();
        this.model = model;
        this.element = document.createElement('ul');
        parent.appendChild(this.element);

        this.render();
        this.setEvents();

        // events from model
        this.model.on('itemRemoved', payload => this.removeItem(payload));
        this.model.on('itemChanged', payload => this.reRenderItem(payload));
        this.model.on('itemAdded', payload => this.addItem(payload));
        this.model.on('itemsSorted', () => this.render());
    }

    getItemById(id) {
        return this.element.querySelector(`li[data-id="${ id }"]`);
    }

    template(item) {
        const { id, name } = item;
        
        return `
            <li class="ololo" data-id="${ id }"> 
                ${ name } 
                <button class="edit" data-id="${ id }">edit</button>
                <button class="delete" data-id="${ id }">X</button>
            </li>
        `;
    };

    setEvents() {
        this.element.addEventListener('click', e => {
            const { classList } = e.target; 

            if (classList.contains('delete')) {
                this.emit('deleteItem', { id: e.target.dataset.id });
            }

            if (classList.contains('edit')) {
                this.emit('editItem', { item: this.model.findItemById(e.target.dataset.id) });
            }
        });
    }

    addItem({ item }) {
        this.element.insertAdjacentHTML('beforeend', this.template(item))
    }

    removeItem({ id }) {
        const itemToRemove = this.getItemById(id);
        this.element.removeChild(itemToRemove);
    }

    reRenderItem({ item }) {
        const oldElement = this.getItemById(item.id);
        oldElement.insertAdjacentHTML('afterend', this.template(item));
        oldElement.remove();
    }

    render() {
        const { items } = this.model;

        this.element.innerHTML = '';
        items.forEach(item => {
            this.element.insertAdjacentHTML('beforeend', this.template(item));
        });
    }
}

class ListPanelView extends EventEmitter {
    constructor(parent) {
        super();
        this.element = document.createElement('div');
        parent.appendChild(this.element);

        this.render();
    }

    template() {
        return `
            <button class="add">Add</button>
            <button class="sort">Sort By:</button>
            <select class="sortField">
                <option value="name">Name</option>
            </select>
        `;
    }

    render() {
        this.element.insertAdjacentHTML('afterBegin', this.template());

        this.element.addEventListener('click', e => {
            const { classList } = e.target;

            if (classList.contains('add')) {
                this.emit('addItem');
            }

            if (classList.contains('sort')) {
                const field = this.element.querySelector('.sortField').value;

                this.emit('sortItems', { field });
            }
        });
    }
}

export default class ListController {
    constructor(elements, parent) {
        this.model = new ListModel(elements);
        this.view = new ListView(this.model, parent);
        this.panelView = new ListPanelView(parent);

        // events from view
        this.view.on('deleteItem', payload => this.model.removeItem(payload));
        this.view.on('editItem', payload => eventBus.emit('openEditModal', payload));
        this.panelView.on('addItem', () => eventBus.emit('openAddModal'));
        this.panelView.on('sortItems', payload => this.model.sortItemsBy(payload));

        // events from model
        this.model.on('itemRemoved', payload => eventBus.emit('closeModal', payload));

        // events from other components
        eventBus.on('editItem', payload => this.model.editItem(payload));
        eventBus.on('addItem', payload => this.model.addItem(payload));
    }
}