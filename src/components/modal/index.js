import { eventBus } from './../../helpers/eventEmitter';

class ModalView {
    template(item) {
        const action = item ? 'edit' : 'add';

        return `
            <form action="#" onsubmit="return false" class="modal">
                <header class="modal__header">
                    ${ item ? 'Editing' : 'Adding'}
                    <button class="close">X</button>
                </header>
                name:
                <input type="text" name="name" value="${ item ? item.name : '' }">
                <input type="submit" class="${ action }" value="${ action }">
            </form>
        `;
    }

    close() {
        this.element.remove();
    };

    getFieldValues() {
        return {
            name: this.element.querySelector('[name="name"]').value
        }
    }

    setEvents(item) {
        this.element.addEventListener('click', e => {

            if (e.target.classList.contains('close')) {
                this.close();
            }

            if (e.target.classList.contains('edit')) {
                eventBus.emit('editItem', {
                    id: item.id,
                    updatedProps: this.getFieldValues(),
                });
                this.close();
            }

            if (e.target.classList.contains('add')) {
                eventBus.emit('addItem', this.getFieldValues());
                this.close();
            }
        });
    }

    render(item) {
        if (this.element) this.close();
        document.body.insertAdjacentHTML('beforeend', this.template(item));
        this.element = document.body.lastElementChild;
        this.setEvents(item);
    }
}

export default class ModalController {
    constructor() {
        this.view = new ModalView();

        eventBus.on('openEditModal', ({ item }) => {
            this.id = item.id;
            this.view.render(item)
        });
        eventBus.on('openAddModal', () => this.view.render());
        eventBus.on('closeModal', ({ id }) => {
            if (this.id === id) this.view.close();
        });
    }
}