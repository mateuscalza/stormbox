/**
 * ES7 AutoComplete
 *
 * @author Jackson Veroneze <jackson@inovadora.com.br>
 * @author Ladislau Perrony <ladislau.perrony@inovadora.com.br>
 * @author Mario Mendonça <mario@inovadora.com.br>
 * @author Mateus Calza <mateus@inovadora.com.br>
 * @author Patrick Nascimento <patrick@inovadora.com.br>
 * @license MIT
 * @version 1.0.0
 */

import AutoComplete from './components/AutoComplete';

import AjaxSource from './sources/AjaxSource';
import SelectSource from './sources/SelectSource';
import ArraySource from './sources/ArraySource';

const autocomplete = options => new AutoComplete(options);
autocomplete.ajax = url => new AjaxSource(url);
autocomplete.select = select => new SelectSource(select);
autocomplete.array = array => new ArraySource(array);
autocomplete.byId = id => document.getElementById(id);

if(typeof window !== 'undefined') {
    window.__autocomplete_serial_key = 0;
    window.autocomplete = autocomplete;
}

export default autocomplete;
