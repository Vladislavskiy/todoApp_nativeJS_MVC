import List from './components/list';
import Modal from './components/modal';
import { uuid } from './helpers/uuid';

new List([
    { 
        name: 'element1',
        id: uuid(),
    },
    { 
        name: 'element2',
        id: uuid(),
    },{ 
        name: 'element3',
        id: uuid(),
    },
], document.querySelector('.container'));

new Modal();