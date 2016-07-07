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

import 'babel-regenerator-runtime';
import AutoComplete from './components/AutoComplete';

import Source from './sources/Source';
import AjaxSource from './sources/AjaxSource';
import SelectSource from './sources/SelectSource';
import ArraySource from './sources/ArraySource';

AutoComplete.AjaxSource = AjaxSource;
AutoComplete.SelectSource = SelectSource;
AutoComplete.ArraySource = ArraySource;

AutoComplete.abstracts = {
    Source
};

export default AutoComplete;

if(typeof window !== 'undefined') {
    window.AutoCompleteWidget = AutoComplete;
}

