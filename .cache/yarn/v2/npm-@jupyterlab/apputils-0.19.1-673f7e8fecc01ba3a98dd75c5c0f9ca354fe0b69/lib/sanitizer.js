"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
const sanitize_html_1 = __importDefault(require("sanitize-html"));
/**
 * Helper class that contains regular expressions for inline CSS style validation.
 *
 * Which properties (and values) to allow is largly based on the Google Caja project:
 *   https://github.com/google/caja
 *
 * The regular expressions are largly based on the syntax definition found at
 * https://developer.mozilla.org/en-US/docs/Web/CSS.
 */
class CssProp {
    static reg(r) {
        return new RegExp('^' + r + '$', 'i');
    }
}
/*
 * Numeric base expressions used to help build more complex regular expressions
 */
CssProp.N = {
    integer: `[+-]?[0-9]+`,
    integer_pos: `[+]?[0-9]+`,
    integer_zero_ff: `([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])`,
    number: `[+-]?([0-9]*[.])?[0-9]+(e-?[0-9]*)?`,
    number_pos: `[+]?([0-9]*[.])?[0-9]+(e-?[0-9]*)?`,
    number_zero_hundred: `[+]?(([0-9]|[1-9][0-9])([.][0-9]+)?|100)`,
    number_zero_one: `[+]?(1([.][0]+)?|0([.][0-9]+)?)`
};
/*
 * Base expressions of common CSS syntax elements
 */
CssProp.B = {
    angle: `(${CssProp.N.number}(deg|rad|grad|turn)|0)`,
    frequency: `${CssProp.N.number}(Hz|kHz)`,
    ident: String.raw `-?([_a-z]|[\xA0-\xFF]|\\[0-9a-f]{1,6}(\r\n|[ \t\r\n\f])?|\\[^\r\n\f0-9a-f])([_a-z0-9-]|[\xA0-\xFF]|\\[0-9a-f]{1,6}(\r\n|[ \t\r\n\f])?|\\[^\r\n\f0-9a-f])*`,
    len_or_perc: `(0|${CssProp.N.number}(px|em|rem|ex|in|cm|mm|pt|pc|%))`,
    length: `(${CssProp.N.number}(px|em|rem|ex|in|cm|mm|pt|pc)|0)`,
    length_pos: `(${CssProp.N.number_pos}(px|em|rem|ex|in|cm|mm|pt|pc)|0)`,
    percentage: `${CssProp.N.number}%`,
    percentage_pos: `${CssProp.N.number_pos}%`,
    percentage_zero_hundred: `${CssProp.N.number_zero_hundred}%`,
    string: String.raw `(\"([^\n\r\f\\"]|\\\n|\r\n|\r|\f|\\[0-9a-f]{1,6}(\r\n|[ \t\r\n\f])?|\\[^\r\n\f0-9a-f])*\")|(\'([^\n\r\f\\']|\\\n|\r\n|\r|\f|\\[0-9a-f]{1,6}(\r\n|[ \t\r\n\f])?|\\[^\r\n\f0-9a-f])*\')`,
    time: `${CssProp.N.number}(s|ms)`,
    url: `url\\(.*?\\)`,
    z_index: `[+-]?[0-9]{1,7}`
};
/*
 * Atomic (i.e. not dependant on other regular expresions) sub RegEx segments
 */
CssProp.A = {
    absolute_size: `xx-small|x-small|small|medium|large|x-large|xx-large`,
    attachment: `scroll|fixed|local`,
    bg_origin: `border-box|padding-box|content-box`,
    border_style: `none|hidden|dotted|dashed|solid|double|groove|ridge|inset|outset`,
    box: `border-box|padding-box|content-box`,
    display_inside: `auto|block|table|flex|grid`,
    display_outside: `block-level|inline-level|none|table-row-group|table-header-group|table-footer-group|table-row|table-cell|table-column-group|table-column|table-caption`,
    ending_shape: `circle|ellipse`,
    generic_family: `serif|sans-serif|cursive|fantasy|monospace`,
    generic_voice: `male|female|child`,
    relative_size: `smaller|larger`,
    repeat_style: `repeat-x|repeat-y|((?:repeat|space|round|no-repeat)(?:\\s*(?:repeat|space|round|no-repeat))?)`,
    side_or_corner: `(left|right)?\\s*(top|bottom)?`,
    single_animation_direction: `normal|reverse|alternate|alternate-reverse`,
    single_animation_fill_mode: `none|forwards|backwards|both`,
    single_animation_play_state: `running|paused`
};
/*
 * Color definition sub expressions
 */
CssProp._COLOR = {
    hex: `\\#(0x)?[0-9a-f]+`,
    name: `aliceblue|antiquewhite|aqua|aquamarine|azure|beige|bisque|black|blanchedalmond|blue|blueviolet|brown|burlywood|cadetblue|chartreuse|chocolate|coral|cornflowerblue|cornsilk|crimson|cyan|darkblue|darkcyan|darkgoldenrod|darkgray|darkgreen|darkkhaki|darkmagenta|darkolivegreen|darkorange|darkorchid|darkred|darksalmon|darkseagreen|darkslateblue|darkslategray|darkturquoise|darkviolet|deeppink|deepskyblue|dimgray|dodgerblue|firebrick|floralwhite|forestgreen|fuchsia|gainsboro|ghostwhite|gold|goldenrod|gray|green|greenyellow|honeydew|hotpink|indianred|indigo|ivory|khaki|lavender|lavenderblush|lawngreen|lemonchiffon|lightblue|lightcoral|lightcyan|lightgoldenrodyellow|lightgreen|lightgrey|lightpink|lightsalmon|lightseagreen|lightskyblue|lightslategray|lightsteelblue|lightyellow|lime|limegreen|linen|magenta|maroon|mediumaquamarine|mediumblue|mediumorchid|mediumpurple|mediumseagreen|mediumslateblue|mediumspringgreen|mediumturquoise|mediumvioletred|midnightblue|mintcream|mistyrose|moccasin|navajowhite|navy|oldlace|olive|olivedrab|orange|orangered|orchid|palegoldenrod|palegreen|paleturquoise|palevioletred|papayawhip|peachpuff|peru|pink|plum|powderblue|purple|red|rosybrown|royalblue|saddlebrown|salmon|sandybrown|seagreen|seashell|sienna|silver|skyblue|slateblue|slategray|snow|springgreen|steelblue|tan|teal|thistle|tomato|turquoise|transparent|violet|wheat|white|whitesmoke|yellow|yellowgreen`,
    rgb: String.raw `rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)`,
    rgba: String.raw `rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(${CssProp.N.integer_zero_ff}|${CssProp.N.number_zero_one}|${CssProp.B.percentage_zero_hundred})\s*\)`
};
/*
 * Compound (i.e. dependant on other (sub) regular expresions) sub RegEx segments
 */
CssProp._C = {
    alpha: `${CssProp.N.integer_zero_ff}|${CssProp.N.number_zero_one}|${CssProp.B.percentage_zero_hundred}`,
    alphavalue: CssProp.N.number_zero_one,
    bg_position: `((${CssProp.B.len_or_perc}|left|center|right|top|bottom)\\s*){1,4}`,
    bg_size: `(${CssProp.B.length_pos}|${CssProp.B.percentage}|auto){1,2}|cover|contain`,
    border_width: `thin|medium|thick|${CssProp.B.length}`,
    bottom: `${CssProp.B.length}|auto`,
    color: `${CssProp._COLOR.hex}|${CssProp._COLOR.rgb}|${CssProp._COLOR.rgba}|${CssProp._COLOR.name}`,
    family_name: `${CssProp.B.string}|(${CssProp.B.ident}\\s*)+`,
    image_decl: CssProp.B.url,
    left: `${CssProp.B.length}|auto`,
    loose_quotable_words: `(${CssProp.B.ident})+`,
    margin_width: `${CssProp.B.len_or_perc}|auto`,
    padding_width: `${CssProp.B.length_pos}|${CssProp.B.percentage_pos}`,
    page_url: CssProp.B.url,
    position: `((${CssProp.B.len_or_perc}|left|center|right|top|bottom)\\s*){1,4}`,
    right: `${CssProp.B.length}|auto`,
    shadow: '',
    size: `closest-side|farthest-side|closest-corner|farthest-corner|${CssProp.B.length}|(${CssProp.B.len_or_perc})\\s+(${CssProp.B.len_or_perc})`,
    top: `${CssProp.B.length}|auto`
};
CssProp._C1 = {
    image_list: `image\\(\\s*(${CssProp.B.url})*\\s*(${CssProp.B.url}|${CssProp._C.color})\\s*\\)`,
    shadow: `((${CssProp._C.color})\\s+((${CssProp.B.length})\\s*){2,4}(\s+inset)?)|((inset\\s+)?((${CssProp.B.length})\\s*){2,4}\\s*(${CssProp._C.color})?)`
};
CssProp._C2 = {
    bg_image: `(${CssProp.B.url}|${CssProp._C1.image_list})|none`,
    image: `${CssProp.B.url}|${CssProp._C1.image_list}`,
    shape: `rect\\(\\s*(${CssProp._C.top})\\s*,\\s*(${CssProp._C.right})\\s*,\\s*(${CssProp._C.bottom})\\s*,\\s*(${CssProp._C.left})\\s*\\)`
};
CssProp.C = Object.assign({}, CssProp._C, CssProp._C1, CssProp._C2);
/*
 * Property value regular expressions not dependant on other sub expressions
 */
CssProp.AP = {
    border_collapse: `collapse|separate`,
    box: `normal|none|contents`,
    box_sizing: `content-box|padding-box|border-box`,
    caption_side: `top|bottom`,
    clear: `none|left|right|both`,
    direction: `ltr|rtl`,
    empty_cells: `show|hide`,
    float: `left|right|none`,
    font_stretch: `normal|wider|narrower|ultra-condensed|extra-condensed|condensed|semi-condensed|semi-expanded|expanded|extra-expanded|ultra-expanded`,
    font_style: `normal|italic|oblique`,
    font_variant: `normal|small-caps`,
    font_weight: `normal|bold|bolder|lighter|100|200|300|400|500|600|700|800|900`,
    list_style_position: `inside|outside`,
    list_style_type: `disc|circle|square|decimal|decimal-leading-zero|lower-roman|upper-roman|lower-greek|lower-latin|upper-latin|armenian|georgian|lower-alpha|upper-alpha|none`,
    overflow: `visible|hidden|scroll|auto`,
    overflow_wrap: `normal|break-word`,
    overflow_x: `visible|hidden|scroll|auto|no-display|no-content`,
    page_break_after: `auto|always|avoid|left|right`,
    page_break_before: `auto|always|avoid|left|right`,
    page_break_inside: `avoid|auto`,
    position: `static|relative|absolute`,
    resize: `none|both|horizontal|vertical`,
    speak: `normal|none|spell-out`,
    speak_header: `once|always`,
    speak_numeral: `digits|continuous`,
    speak_punctuation: `code|none`,
    table_layout: `auto|fixed`,
    text_align: `left|right|center|justify`,
    text_decoration: `none|((underline|overline|line-through|blink)\\s*)+`,
    text_transform: `capitalize|uppercase|lowercase|none`,
    text_wrap: `normal|unrestricted|none|suppress`,
    unicode_bidi: `normal|embed|bidi-override`,
    visibility: `visible|hidden|collapse`,
    white_space: `normal|pre|nowrap|pre-wrap|pre-line`,
    word_break: `normal|keep-all|break-all`
};
/*
 * Compound propertiy value regular expressions (i.e. dependant on other sub expressions)
 */
CssProp._CP = {
    background_attachment: `${CssProp.A.attachment}(,\\s*${CssProp.A.attachment})*`,
    background_color: CssProp.C.color,
    background_origin: `${CssProp.A.box}(,\\s*${CssProp.A.box})*`,
    background_repeat: `${CssProp.A.repeat_style}(,\\s*${CssProp.A.repeat_style})*`,
    border: `((${CssProp.C.border_width}|${CssProp.A.border_style}|${CssProp.C.color})\\s*){1,3}`,
    border_radius: `((${CssProp.B.len_or_perc})\\s*){1,4}(\\/\\s*((${CssProp.B.len_or_perc})\\s*){1,4})?`,
    border_spacing: `${CssProp.B.length}\\s*(${CssProp.B.length})?`,
    border_top_color: CssProp.C.color,
    border_top_style: CssProp.A.border_style,
    border_width: `((${CssProp.C.border_width})\\s*){1,4}`,
    color: CssProp.C.color,
    cursor: `(${CssProp.B.url}(\\s*,\\s*)?)*(auto|crosshair|default|pointer|move|e-resize|ne-resize|nw-resize|n-resize|se-resize|sw-resize|s-resize|w-resize|text|wait|help|progress|all-scroll|col-resize|hand|no-drop|not-allowed|row-resize|vertical-text)`,
    display: `inline|block|list-item|run-in|inline-list-item|inline-block|table|inline-table|table-cell|table-caption|flex|inline-flex|grid|inline-grid|${CssProp.A.display_inside}|${CssProp.A.display_outside}|inherit|inline-box|inline-stack`,
    display_outside: CssProp.A.display_outside,
    elevation: `${CssProp.B.angle}|below|level|above|higher|lower`,
    font_family: `(${CssProp.C.family_name}|${CssProp.A.generic_family})(,\\s*(${CssProp.C.family_name}|${CssProp.A.generic_family}))*`,
    height: `${CssProp.B.length}|${CssProp.B.percentage}|auto`,
    letter_spacing: `normal|${CssProp.B.length}`,
    list_style_image: `${CssProp.C.image}|none`,
    margin_right: CssProp.C.margin_width,
    max_height: `${CssProp.B.length_pos}|${CssProp.B.percentage_pos}|none|auto`,
    min_height: `${CssProp.B.length_pos}|${CssProp.B.percentage_pos}|auto`,
    opacity: CssProp.C.alphavalue,
    outline_color: `${CssProp.C.color}|invert`,
    outline_width: CssProp.C.border_width,
    padding: `((${CssProp.C.padding_width})\\s*){1,4}`,
    padding_top: CssProp.C.padding_width,
    pitch_range: CssProp.N.number,
    right: `${CssProp.B.length}|${CssProp.B.percentage}|auto`,
    stress: CssProp.N.number,
    text_indent: `${CssProp.B.length}|${CssProp.B.percentage}`,
    text_shadow: `none|${CssProp.C.shadow}(,\\s*(${CssProp.C.shadow}))*`,
    volume: `${CssProp.N.number_pos}|${CssProp.B.percentage_pos}|silent|x-soft|soft|medium|loud|x-loud`,
    word_wrap: CssProp.AP.overflow_wrap,
    zoom: `normal|${CssProp.N.number_pos}|${CssProp.B.percentage_pos}`,
    backface_visibility: CssProp.AP.visibility,
    background_clip: `${CssProp.A.box}(,\\s*(${CssProp.A.box}))*`,
    background_position: `${CssProp.C.bg_position}(,\\s*(${CssProp.C.bg_position}))*`,
    border_bottom_color: CssProp.C.color,
    border_bottom_style: CssProp.A.border_style,
    border_color: `((${CssProp.C.color})\\s*){1,4}`,
    border_left_color: CssProp.C.color,
    border_right_color: CssProp.C.color,
    border_style: `((${CssProp.A.border_style})\\s*){1,4}`,
    border_top_left_radius: `(${CssProp.B.length}|${CssProp.B.percentage})(\\s*(${CssProp.B.length}|${CssProp.B.percentage}))?`,
    border_top_width: CssProp.C.border_width,
    box_shadow: `none|${CssProp.C.shadow}(,\\s*(${CssProp.C.shadow}))*`,
    clip: `${CssProp.C.shape}|auto`,
    display_inside: CssProp.A.display_inside,
    font_size: `${CssProp.A.absolute_size}|${CssProp.A.relative_size}|${CssProp.B.length_pos}|${CssProp.B.percentage_pos}`,
    line_height: `normal|${CssProp.N.number_pos}|${CssProp.B.length_pos}|${CssProp.B.percentage_pos}`,
    margin_left: CssProp.C.margin_width,
    max_width: `${CssProp.B.length_pos}|${CssProp.B.percentage_pos}|none|auto`,
    outline_style: CssProp.A.border_style,
    padding_bottom: CssProp.C.padding_width,
    padding_right: CssProp.C.padding_width,
    perspective: `none|${CssProp.B.length}`,
    richness: CssProp.N.number,
    text_overflow: `((clip|ellipsis|${CssProp.B.string})\\s*){1,2}`,
    top: `${CssProp.B.length}|${CssProp.B.percentage}|auto`,
    width: `${CssProp.B.length_pos}|${CssProp.B.percentage_pos}|auto`,
    z_index: `auto|${CssProp.B.z_index}`,
    // Simplified background
    background: `(((${CssProp.C.bg_position}\\s*(\\/\\s*${CssProp.C.bg_size})?)|(${CssProp.A.repeat_style})|(${CssProp.A.attachment})|(${CssProp.A.bg_origin})|(${CssProp.C.bg_image})|(${CssProp.C.color}))\\s*)+`,
    background_size: `${CssProp.C.bg_size}(,\\s*${CssProp.C.bg_size})*`,
    border_bottom_left_radius: `(${CssProp.B.length}|${CssProp.B.percentage})(\\s*(${CssProp.B.length}|${CssProp.B.percentage}))?`,
    border_bottom_width: CssProp.C.border_width,
    border_left_style: CssProp.A.border_style,
    border_right_style: CssProp.A.border_style,
    border_top: `((${CssProp.C.border_width}|${CssProp.A.border_style}|${CssProp.C.color})\\s*){1,3}`,
    bottom: `${CssProp.B.len_or_perc}|auto`,
    list_style: `((${CssProp.AP.list_style_type}|${CssProp.AP.list_style_position}|${CssProp.C.image}|none})\\s*){1,3}`,
    margin_top: CssProp.C.margin_width,
    outline: `((${CssProp.C.color}|invert|${CssProp.A.border_style}|${CssProp.C.border_width})\\s*){1,3}`,
    overflow_y: CssProp.AP.overflow_x,
    pitch: `${CssProp.B.frequency}|x-low|low|medium|high|x-high`,
    vertical_align: `baseline|sub|super|top|text-top|middle|bottom|text-bottom|${CssProp.B.len_or_perc}`,
    word_spacing: `normal|${CssProp.B.length}`,
    background_image: `${CssProp.C.bg_image}(,\\s*${CssProp.C.bg_image})*`,
    border_bottom_right_radius: `(${CssProp.B.length}|${CssProp.B.percentage})(\\s*(${CssProp.B.length}|${CssProp.B.percentage}))?`,
    border_left_width: CssProp.C.border_width,
    border_right_width: CssProp.C.border_width,
    left: `${CssProp.B.len_or_perc}|auto`,
    margin_bottom: CssProp.C.margin_width,
    pause_after: `${CssProp.B.time}|${CssProp.B.percentage}`,
    speech_rate: `${CssProp.N.number}|x-slow|slow|medium|fast|x-fast|faster|slower`,
    transition_duration: `${CssProp.B.time}(,\\s*${CssProp.B.time})*`,
    border_bottom: `((${CssProp.C.border_width}|${CssProp.A.border_style}|${CssProp.C.color})\\s*){1,3}`,
    border_right: `((${CssProp.C.border_width}|${CssProp.A.border_style}|${CssProp.C.color})\\s*){1,3}`,
    margin: `((${CssProp.C.margin_width})\\s*){1,4}`,
    padding_left: CssProp.C.padding_width,
    border_left: `((${CssProp.C.border_width}|${CssProp.A.border_style}|${CssProp.C.color})\\s*){1,3}`,
    quotes: `(${CssProp.B.string}\\s*${CssProp.B.string})+|none`,
    border_top_right_radius: `(${CssProp.B.length}|${CssProp.B.percentage})(\\s*(${CssProp.B.length}|${CssProp.B.percentage}))?`,
    min_width: `${CssProp.B.length_pos}|${CssProp.B.percentage_pos}|auto`
};
CssProp._CP1 = {
    font: `(((((${CssProp.AP.font_style}|${CssProp.AP.font_variant}|${CssProp.AP.font_weight})\\s*){1,3})?\\s*(${CssProp._CP.font_size})\\s*(\\/\\s*(${CssProp._CP.line_height}))?\\s+(${CssProp._CP.font_family}))|caption|icon|menu|message-box|small-caption|status-bar)`
};
CssProp.CP = Object.assign({}, CssProp._CP, CssProp._CP1);
// CSS Property value validation regular expressions for use with sanitize-html
CssProp.BORDER_COLLAPSE = CssProp.reg(CssProp.AP.border_collapse);
CssProp.BOX = CssProp.reg(CssProp.AP.box);
CssProp.BOX_SIZING = CssProp.reg(CssProp.AP.box_sizing);
CssProp.CAPTION_SIDE = CssProp.reg(CssProp.AP.caption_side);
CssProp.CLEAR = CssProp.reg(CssProp.AP.clear);
CssProp.DIRECTION = CssProp.reg(CssProp.AP.direction);
CssProp.EMPTY_CELLS = CssProp.reg(CssProp.AP.empty_cells);
CssProp.FLOAT = CssProp.reg(CssProp.AP.float);
CssProp.FONT_STRETCH = CssProp.reg(CssProp.AP.font_stretch);
CssProp.FONT_STYLE = CssProp.reg(CssProp.AP.font_style);
CssProp.FONT_VARIANT = CssProp.reg(CssProp.AP.font_variant);
CssProp.FONT_WEIGHT = CssProp.reg(CssProp.AP.font_weight);
CssProp.LIST_STYLE_POSITION = CssProp.reg(CssProp.AP.list_style_position);
CssProp.LIST_STYLE_TYPE = CssProp.reg(CssProp.AP.list_style_type);
CssProp.OVERFLOW = CssProp.reg(CssProp.AP.overflow);
CssProp.OVERFLOW_WRAP = CssProp.reg(CssProp.AP.overflow_wrap);
CssProp.OVERFLOW_X = CssProp.reg(CssProp.AP.overflow_x);
CssProp.PAGE_BREAK_AFTER = CssProp.reg(CssProp.AP.page_break_after);
CssProp.PAGE_BREAK_BEFORE = CssProp.reg(CssProp.AP.page_break_before);
CssProp.PAGE_BREAK_INSIDE = CssProp.reg(CssProp.AP.page_break_inside);
CssProp.POSITION = CssProp.reg(CssProp.AP.position);
CssProp.RESIZE = CssProp.reg(CssProp.AP.resize);
CssProp.SPEAK = CssProp.reg(CssProp.AP.speak);
CssProp.SPEAK_HEADER = CssProp.reg(CssProp.AP.speak_header);
CssProp.SPEAK_NUMERAL = CssProp.reg(CssProp.AP.speak_numeral);
CssProp.SPEAK_PUNCTUATION = CssProp.reg(CssProp.AP.speak_punctuation);
CssProp.TABLE_LAYOUT = CssProp.reg(CssProp.AP.table_layout);
CssProp.TEXT_ALIGN = CssProp.reg(CssProp.AP.text_align);
CssProp.TEXT_DECORATION = CssProp.reg(CssProp.AP.text_decoration);
CssProp.TEXT_TRANSFORM = CssProp.reg(CssProp.AP.text_transform);
CssProp.TEXT_WRAP = CssProp.reg(CssProp.AP.text_wrap);
CssProp.UNICODE_BIDI = CssProp.reg(CssProp.AP.unicode_bidi);
CssProp.VISIBILITY = CssProp.reg(CssProp.AP.visibility);
CssProp.WHITE_SPACE = CssProp.reg(CssProp.AP.white_space);
CssProp.WORD_BREAK = CssProp.reg(CssProp.AP.word_break);
CssProp.BACKGROUND_ATTACHMENT = CssProp.reg(CssProp.CP.background_attachment);
CssProp.BACKGROUND_COLOR = CssProp.reg(CssProp.CP.background_color);
CssProp.BACKGROUND_ORIGIN = CssProp.reg(CssProp.CP.background_origin);
CssProp.BACKGROUND_REPEAT = CssProp.reg(CssProp.CP.background_repeat);
CssProp.BORDER = CssProp.reg(CssProp.CP.border);
CssProp.BORDER_RADIUS = CssProp.reg(CssProp.CP.border_radius);
CssProp.BORDER_SPACING = CssProp.reg(CssProp.CP.border_spacing);
CssProp.BORDER_TOP_COLOR = CssProp.reg(CssProp.CP.border_top_color);
CssProp.BORDER_TOP_STYLE = CssProp.reg(CssProp.CP.border_top_style);
CssProp.BORDER_WIDTH = CssProp.reg(CssProp.CP.border_width);
CssProp.COLOR = CssProp.reg(CssProp.CP.color);
CssProp.CURSOR = CssProp.reg(CssProp.CP.cursor);
CssProp.DISPLAY = CssProp.reg(CssProp.CP.display);
CssProp.DISPLAY_OUTSIDE = CssProp.reg(CssProp.CP.display_outside);
CssProp.ELEVATION = CssProp.reg(CssProp.CP.elevation);
CssProp.FONT_FAMILY = CssProp.reg(CssProp.CP.font_family);
CssProp.HEIGHT = CssProp.reg(CssProp.CP.height);
CssProp.LETTER_SPACING = CssProp.reg(CssProp.CP.letter_spacing);
CssProp.LIST_STYLE_IMAGE = CssProp.reg(CssProp.CP.list_style_image);
CssProp.MARGIN_RIGHT = CssProp.reg(CssProp.CP.margin_right);
CssProp.MAX_HEIGHT = CssProp.reg(CssProp.CP.max_height);
CssProp.MIN_HEIGHT = CssProp.reg(CssProp.CP.min_height);
CssProp.OPACITY = CssProp.reg(CssProp.CP.opacity);
CssProp.OUTLINE_COLOR = CssProp.reg(CssProp.CP.outline_color);
CssProp.OUTLINE_WIDTH = CssProp.reg(CssProp.CP.outline_width);
CssProp.PADDING = CssProp.reg(CssProp.CP.padding);
CssProp.PADDING_TOP = CssProp.reg(CssProp.CP.padding_top);
CssProp.PITCH_RANGE = CssProp.reg(CssProp.CP.pitch_range);
CssProp.RIGHT = CssProp.reg(CssProp.CP.right);
CssProp.STRESS = CssProp.reg(CssProp.CP.stress);
CssProp.TEXT_INDENT = CssProp.reg(CssProp.CP.text_indent);
CssProp.TEXT_SHADOW = CssProp.reg(CssProp.CP.text_shadow);
CssProp.VOLUME = CssProp.reg(CssProp.CP.volume);
CssProp.WORD_WRAP = CssProp.reg(CssProp.CP.word_wrap);
CssProp.ZOOM = CssProp.reg(CssProp.CP.zoom);
CssProp.BACKFACE_VISIBILITY = CssProp.reg(CssProp.CP.backface_visibility);
CssProp.BACKGROUND_CLIP = CssProp.reg(CssProp.CP.background_clip);
CssProp.BACKGROUND_POSITION = CssProp.reg(CssProp.CP.background_position);
CssProp.BORDER_BOTTOM_COLOR = CssProp.reg(CssProp.CP.border_bottom_color);
CssProp.BORDER_BOTTOM_STYLE = CssProp.reg(CssProp.CP.border_bottom_style);
CssProp.BORDER_COLOR = CssProp.reg(CssProp.CP.border_color);
CssProp.BORDER_LEFT_COLOR = CssProp.reg(CssProp.CP.border_left_color);
CssProp.BORDER_RIGHT_COLOR = CssProp.reg(CssProp.CP.border_right_color);
CssProp.BORDER_STYLE = CssProp.reg(CssProp.CP.border_style);
CssProp.BORDER_TOP_LEFT_RADIUS = CssProp.reg(CssProp.CP.border_top_left_radius);
CssProp.BORDER_TOP_WIDTH = CssProp.reg(CssProp.CP.border_top_width);
CssProp.BOX_SHADOW = CssProp.reg(CssProp.CP.box_shadow);
CssProp.CLIP = CssProp.reg(CssProp.CP.clip);
CssProp.DISPLAY_INSIDE = CssProp.reg(CssProp.CP.display_inside);
CssProp.FONT_SIZE = CssProp.reg(CssProp.CP.font_size);
CssProp.LINE_HEIGHT = CssProp.reg(CssProp.CP.line_height);
CssProp.MARGIN_LEFT = CssProp.reg(CssProp.CP.margin_left);
CssProp.MAX_WIDTH = CssProp.reg(CssProp.CP.max_width);
CssProp.OUTLINE_STYLE = CssProp.reg(CssProp.CP.outline_style);
CssProp.PADDING_BOTTOM = CssProp.reg(CssProp.CP.padding_bottom);
CssProp.PADDING_RIGHT = CssProp.reg(CssProp.CP.padding_right);
CssProp.PERSPECTIVE = CssProp.reg(CssProp.CP.perspective);
CssProp.RICHNESS = CssProp.reg(CssProp.CP.richness);
CssProp.TEXT_OVERFLOW = CssProp.reg(CssProp.CP.text_overflow);
CssProp.TOP = CssProp.reg(CssProp.CP.top);
CssProp.WIDTH = CssProp.reg(CssProp.CP.width);
CssProp.Z_INDEX = CssProp.reg(CssProp.CP.z_index);
CssProp.BACKGROUND = CssProp.reg(CssProp.CP.background);
CssProp.BACKGROUND_SIZE = CssProp.reg(CssProp.CP.background_size);
CssProp.BORDER_BOTTOM_LEFT_RADIUS = CssProp.reg(CssProp.CP.border_bottom_left_radius);
CssProp.BORDER_BOTTOM_WIDTH = CssProp.reg(CssProp.CP.border_bottom_width);
CssProp.BORDER_LEFT_STYLE = CssProp.reg(CssProp.CP.border_left_style);
CssProp.BORDER_RIGHT_STYLE = CssProp.reg(CssProp.CP.border_right_style);
CssProp.BORDER_TOP = CssProp.reg(CssProp.CP.border_top);
CssProp.BOTTOM = CssProp.reg(CssProp.CP.bottom);
CssProp.LIST_STYLE = CssProp.reg(CssProp.CP.list_style);
CssProp.MARGIN_TOP = CssProp.reg(CssProp.CP.margin_top);
CssProp.OUTLINE = CssProp.reg(CssProp.CP.outline);
CssProp.OVERFLOW_Y = CssProp.reg(CssProp.CP.overflow_y);
CssProp.PITCH = CssProp.reg(CssProp.CP.pitch);
CssProp.VERTICAL_ALIGN = CssProp.reg(CssProp.CP.vertical_align);
CssProp.WORD_SPACING = CssProp.reg(CssProp.CP.word_spacing);
CssProp.BACKGROUND_IMAGE = CssProp.reg(CssProp.CP.background_image);
CssProp.BORDER_BOTTOM_RIGHT_RADIUS = CssProp.reg(CssProp.CP.border_bottom_right_radius);
CssProp.BORDER_LEFT_WIDTH = CssProp.reg(CssProp.CP.border_left_width);
CssProp.BORDER_RIGHT_WIDTH = CssProp.reg(CssProp.CP.border_right_width);
CssProp.LEFT = CssProp.reg(CssProp.CP.left);
CssProp.MARGIN_BOTTOM = CssProp.reg(CssProp.CP.margin_bottom);
CssProp.PAUSE_AFTER = CssProp.reg(CssProp.CP.pause_after);
CssProp.SPEECH_RATE = CssProp.reg(CssProp.CP.speech_rate);
CssProp.TRANSITION_DURATION = CssProp.reg(CssProp.CP.transition_duration);
CssProp.BORDER_BOTTOM = CssProp.reg(CssProp.CP.border_bottom);
CssProp.BORDER_RIGHT = CssProp.reg(CssProp.CP.border_right);
CssProp.MARGIN = CssProp.reg(CssProp.CP.margin);
CssProp.PADDING_LEFT = CssProp.reg(CssProp.CP.padding_left);
CssProp.BORDER_LEFT = CssProp.reg(CssProp.CP.border_left);
CssProp.FONT = CssProp.reg(CssProp.CP.font);
CssProp.QUOTES = CssProp.reg(CssProp.CP.quotes);
CssProp.BORDER_TOP_RIGHT_RADIUS = CssProp.reg(CssProp.CP.border_top_right_radius);
CssProp.MIN_WIDTH = CssProp.reg(CssProp.CP.min_width);
/**
 * A class to sanitize HTML strings.
 */
class Sanitizer {
    constructor() {
        this._options = {
            // HTML tags that are allowed to be used. Tags were extracted from Google Caja
            allowedTags: [
                'a',
                'abbr',
                'acronym',
                'address',
                'area',
                'article',
                'aside',
                'audio',
                'b',
                'bdi',
                'bdo',
                'big',
                'blockquote',
                'br',
                'button',
                'canvas',
                'caption',
                'center',
                'cite',
                'code',
                'col',
                'colgroup',
                'colspan',
                'command',
                'data',
                'datalist',
                'dd',
                'del',
                'details',
                'dfn',
                'dir',
                'div',
                'dl',
                'dt',
                'em',
                'fieldset',
                'figcaption',
                'figure',
                'font',
                'footer',
                'form',
                'h1',
                'h2',
                'h3',
                'h4',
                'h5',
                'h6',
                'header',
                'hgroup',
                'hr',
                'i',
                // 'iframe' is allowed by Google Caja, but disallowed by default by sanitize-html
                // , 'iframe'
                'img',
                'input',
                'ins',
                'kbd',
                'label',
                'legend',
                'li',
                'map',
                'mark',
                'menu',
                'meter',
                'nav',
                'nobr',
                'ol',
                'optgroup',
                'option',
                'output',
                'p',
                'pre',
                'progress',
                'q',
                'rowspan',
                's',
                'samp',
                'section',
                'select',
                'small',
                'source',
                'span',
                'strike',
                'strong',
                'sub',
                'summary',
                'sup',
                'table',
                'tbody',
                'td',
                'textarea',
                'tfoot',
                'th',
                'thead',
                'time',
                'tr',
                'track',
                'tt',
                'u',
                'ul',
                'var',
                'video',
                'wbr'
            ],
            // Attributes that HTML tags are allowed to have, extracted from Google Caja.
            // See https://github.com/jupyterlab/jupyterlab/issues/1812#issuecomment-285848435
            allowedAttributes: {
                '*': [
                    'class',
                    'dir',
                    'draggable',
                    'hidden',
                    'id',
                    'inert',
                    'itemprop',
                    'itemref',
                    'itemscope',
                    'lang',
                    'spellcheck',
                    'style',
                    'title',
                    'translate'
                ],
                // 'rel' and 'target' were *not* allowed by Google Caja
                a: [
                    'accesskey',
                    'coords',
                    'href',
                    'hreflang',
                    'name',
                    'rel',
                    'shape',
                    'tabindex',
                    'target',
                    'type'
                ],
                area: [
                    'accesskey',
                    'alt',
                    'coords',
                    'href',
                    'nohref',
                    'shape',
                    'tabindex'
                ],
                // 'autoplay' was *not* allowed by Google Caja
                audio: [
                    'autoplay',
                    'controls',
                    'loop',
                    'mediagroup',
                    'muted',
                    'preload',
                    'src'
                ],
                bdo: ['dir'],
                blockquote: ['cite'],
                br: ['clear'],
                button: ['accesskey', 'disabled', 'name', 'tabindex', 'type', 'value'],
                canvas: ['height', 'width'],
                caption: ['align'],
                col: ['align', 'char', 'charoff', 'span', 'valign', 'width'],
                colgroup: ['align', 'char', 'charoff', 'span', 'valign', 'width'],
                command: [
                    'checked',
                    'command',
                    'disabled',
                    'icon',
                    'label',
                    'radiogroup',
                    'type'
                ],
                data: ['value'],
                del: ['cite', 'datetime'],
                details: ['open'],
                dir: ['compact'],
                div: ['align'],
                dl: ['compact'],
                fieldset: ['disabled'],
                font: ['color', 'face', 'size'],
                form: [
                    'accept',
                    'action',
                    'autocomplete',
                    'enctype',
                    'method',
                    'name',
                    'novalidate'
                ],
                h1: ['align'],
                h2: ['align'],
                h3: ['align'],
                h4: ['align'],
                h5: ['align'],
                h6: ['align'],
                hr: ['align', 'noshade', 'size', 'width'],
                iframe: [
                    'align',
                    'frameborder',
                    'height',
                    'marginheight',
                    'marginwidth',
                    'width'
                ],
                img: [
                    'align',
                    'alt',
                    'border',
                    'height',
                    'hspace',
                    'ismap',
                    'name',
                    'src',
                    'usemap',
                    'vspace',
                    'width'
                ],
                input: [
                    'accept',
                    'accesskey',
                    'align',
                    'alt',
                    'autocomplete',
                    'checked',
                    'disabled',
                    'inputmode',
                    'ismap',
                    'list',
                    'max',
                    'maxlength',
                    'min',
                    'multiple',
                    'name',
                    'placeholder',
                    'readonly',
                    'required',
                    'size',
                    'src',
                    'step',
                    'tabindex',
                    'type',
                    'usemap',
                    'value'
                ],
                ins: ['cite', 'datetime'],
                label: ['accesskey', 'for'],
                legend: ['accesskey', 'align'],
                li: ['type', 'value'],
                map: ['name'],
                menu: ['compact', 'label', 'type'],
                meter: ['high', 'low', 'max', 'min', 'value'],
                ol: ['compact', 'reversed', 'start', 'type'],
                optgroup: ['disabled', 'label'],
                option: ['disabled', 'label', 'selected', 'value'],
                output: ['for', 'name'],
                p: ['align'],
                pre: ['width'],
                progress: ['max', 'min', 'value'],
                q: ['cite'],
                select: [
                    'autocomplete',
                    'disabled',
                    'multiple',
                    'name',
                    'required',
                    'size',
                    'tabindex'
                ],
                source: ['type'],
                table: [
                    'align',
                    'bgcolor',
                    'border',
                    'cellpadding',
                    'cellspacing',
                    'frame',
                    'rules',
                    'summary',
                    'width'
                ],
                tbody: ['align', 'char', 'charoff', 'valign'],
                td: [
                    'abbr',
                    'align',
                    'axis',
                    'bgcolor',
                    'char',
                    'charoff',
                    'colspan',
                    'headers',
                    'height',
                    'nowrap',
                    'rowspan',
                    'scope',
                    'valign',
                    'width'
                ],
                textarea: [
                    'accesskey',
                    'autocomplete',
                    'cols',
                    'disabled',
                    'inputmode',
                    'name',
                    'placeholder',
                    'readonly',
                    'required',
                    'rows',
                    'tabindex',
                    'wrap'
                ],
                tfoot: ['align', 'char', 'charoff', 'valign'],
                th: [
                    'abbr',
                    'align',
                    'axis',
                    'bgcolor',
                    'char',
                    'charoff',
                    'colspan',
                    'headers',
                    'height',
                    'nowrap',
                    'rowspan',
                    'scope',
                    'valign',
                    'width'
                ],
                thead: ['align', 'char', 'charoff', 'valign'],
                tr: ['align', 'bgcolor', 'char', 'charoff', 'valign'],
                track: ['default', 'kind', 'label', 'srclang'],
                ul: ['compact', 'type'],
                video: [
                    'autoplay',
                    'controls',
                    'height',
                    'loop',
                    'mediagroup',
                    'muted',
                    'poster',
                    'preload',
                    'src',
                    'width'
                ]
            },
            // Inline CSS styles that HTML tags may have (and their allowed values)
            allowedStyles: {
                // To simplify the data, all styles are allowed on all tags that allow the style attribute
                '*': {
                    'backface-visibility': [CssProp.BACKFACE_VISIBILITY],
                    background: [CssProp.BACKGROUND],
                    'background-attachment': [CssProp.BACKGROUND_ATTACHMENT],
                    'background-clip': [CssProp.BACKGROUND_CLIP],
                    'background-color': [CssProp.BACKGROUND_COLOR],
                    'background-image': [CssProp.BACKGROUND_IMAGE],
                    'background-origin': [CssProp.BACKGROUND_ORIGIN],
                    'background-position': [CssProp.BACKGROUND_POSITION],
                    'background-repeat': [CssProp.BACKGROUND_REPEAT],
                    'background-size': [CssProp.BACKGROUND_SIZE],
                    border: [CssProp.BORDER],
                    'border-bottom': [CssProp.BORDER_BOTTOM],
                    'border-bottom-color': [CssProp.BORDER_BOTTOM_COLOR],
                    'border-bottom-left-radius': [CssProp.BORDER_BOTTOM_LEFT_RADIUS],
                    'border-bottom-right-radius': [CssProp.BORDER_BOTTOM_RIGHT_RADIUS],
                    'border-bottom-style': [CssProp.BORDER_BOTTOM_STYLE],
                    'border-bottom-width': [CssProp.BORDER_BOTTOM_WIDTH],
                    'border-collapse': [CssProp.BORDER_COLLAPSE],
                    'border-color': [CssProp.BORDER_COLOR],
                    'border-left': [CssProp.BORDER_LEFT],
                    'border-left-color': [CssProp.BORDER_LEFT_COLOR],
                    'border-left-style': [CssProp.BORDER_LEFT_STYLE],
                    'border-left-width': [CssProp.BORDER_LEFT_WIDTH],
                    'border-radius': [CssProp.BORDER_RADIUS],
                    'border-right': [CssProp.BORDER_RIGHT],
                    'border-right-color': [CssProp.BORDER_RIGHT_COLOR],
                    'border-right-style': [CssProp.BORDER_RIGHT_STYLE],
                    'border-right-width': [CssProp.BORDER_RIGHT_WIDTH],
                    'border-spacing': [CssProp.BORDER_SPACING],
                    'border-style': [CssProp.BORDER_STYLE],
                    'border-top': [CssProp.BORDER_TOP],
                    'border-top-color': [CssProp.BORDER_TOP_COLOR],
                    'border-top-left-radius': [CssProp.BORDER_TOP_LEFT_RADIUS],
                    'border-top-right-radius': [CssProp.BORDER_TOP_RIGHT_RADIUS],
                    'border-top-style': [CssProp.BORDER_TOP_STYLE],
                    'border-top-width': [CssProp.BORDER_TOP_WIDTH],
                    'border-width': [CssProp.BORDER_WIDTH],
                    bottom: [CssProp.BOTTOM],
                    box: [CssProp.BOX],
                    'box-shadow': [CssProp.BOX_SHADOW],
                    'box-sizing': [CssProp.BOX_SIZING],
                    'caption-side': [CssProp.CAPTION_SIDE],
                    clear: [CssProp.CLEAR],
                    clip: [CssProp.CLIP],
                    color: [CssProp.COLOR],
                    cursor: [CssProp.CURSOR],
                    direction: [CssProp.DIRECTION],
                    display: [CssProp.DISPLAY],
                    'display-inside': [CssProp.DISPLAY_INSIDE],
                    'display-outside': [CssProp.DISPLAY_OUTSIDE],
                    elevation: [CssProp.ELEVATION],
                    'empty-cells': [CssProp.EMPTY_CELLS],
                    float: [CssProp.FLOAT],
                    font: [CssProp.FONT],
                    'font-family': [CssProp.FONT_FAMILY],
                    'font-size': [CssProp.FONT_SIZE],
                    'font-stretch': [CssProp.FONT_STRETCH],
                    'font-style': [CssProp.FONT_STYLE],
                    'font-variant': [CssProp.FONT_VARIANT],
                    'font-weight': [CssProp.FONT_WEIGHT],
                    height: [CssProp.HEIGHT],
                    left: [CssProp.LEFT],
                    'letter-spacing': [CssProp.LETTER_SPACING],
                    'line-height': [CssProp.LINE_HEIGHT],
                    'list-style': [CssProp.LIST_STYLE],
                    'list-style-image': [CssProp.LIST_STYLE_IMAGE],
                    'list-style-position': [CssProp.LIST_STYLE_POSITION],
                    'list-style-type': [CssProp.LIST_STYLE_TYPE],
                    margin: [CssProp.MARGIN],
                    'margin-bottom': [CssProp.MARGIN_BOTTOM],
                    'margin-left': [CssProp.MARGIN_LEFT],
                    'margin-right': [CssProp.MARGIN_RIGHT],
                    'margin-top': [CssProp.MARGIN_TOP],
                    'max-height': [CssProp.MAX_HEIGHT],
                    'max-width': [CssProp.MAX_WIDTH],
                    'min-height': [CssProp.MIN_HEIGHT],
                    'min-width': [CssProp.MIN_WIDTH],
                    opacity: [CssProp.OPACITY],
                    outline: [CssProp.OUTLINE],
                    'outline-color': [CssProp.OUTLINE_COLOR],
                    'outline-style': [CssProp.OUTLINE_STYLE],
                    'outline-width': [CssProp.OUTLINE_WIDTH],
                    overflow: [CssProp.OVERFLOW],
                    'overflow-wrap': [CssProp.OVERFLOW_WRAP],
                    'overflow-x': [CssProp.OVERFLOW_X],
                    'overflow-y': [CssProp.OVERFLOW_Y],
                    padding: [CssProp.PADDING],
                    'padding-bottom': [CssProp.PADDING_BOTTOM],
                    'padding-left': [CssProp.PADDING_LEFT],
                    'padding-right': [CssProp.PADDING_RIGHT],
                    'padding-top': [CssProp.PADDING_TOP],
                    'page-break-after': [CssProp.PAGE_BREAK_AFTER],
                    'page-break-before': [CssProp.PAGE_BREAK_BEFORE],
                    'page-break-inside': [CssProp.PAGE_BREAK_INSIDE],
                    'pause-after': [CssProp.PAUSE_AFTER],
                    perspective: [CssProp.PERSPECTIVE],
                    pitch: [CssProp.PITCH],
                    'pitch-range': [CssProp.PITCH_RANGE],
                    position: [CssProp.POSITION],
                    quotes: [CssProp.QUOTES],
                    resize: [CssProp.RESIZE],
                    richness: [CssProp.RICHNESS],
                    right: [CssProp.RIGHT],
                    speak: [CssProp.SPEAK],
                    'speak-header': [CssProp.SPEAK_HEADER],
                    'speak-numeral': [CssProp.SPEAK_NUMERAL],
                    'speak-punctuation': [CssProp.SPEAK_PUNCTUATION],
                    'speech-rate': [CssProp.SPEECH_RATE],
                    stress: [CssProp.STRESS],
                    'table-layout': [CssProp.TABLE_LAYOUT],
                    'text-align': [CssProp.TEXT_ALIGN],
                    'text-decoration': [CssProp.TEXT_DECORATION],
                    'text-indent': [CssProp.TEXT_INDENT],
                    'text-overflow': [CssProp.TEXT_OVERFLOW],
                    'text-shadow': [CssProp.TEXT_SHADOW],
                    'text-transform': [CssProp.TEXT_TRANSFORM],
                    'text-wrap': [CssProp.TEXT_WRAP],
                    top: [CssProp.TOP],
                    'unicode-bidi': [CssProp.UNICODE_BIDI],
                    'vertical-align': [CssProp.VERTICAL_ALIGN],
                    visibility: [CssProp.VISIBILITY],
                    volume: [CssProp.VOLUME],
                    'white-space': [CssProp.WHITE_SPACE],
                    width: [CssProp.WIDTH],
                    'word-break': [CssProp.WORD_BREAK],
                    'word-spacing': [CssProp.WORD_SPACING],
                    'word-wrap': [CssProp.WORD_WRAP],
                    'z-index': [CssProp.Z_INDEX],
                    zoom: [CssProp.ZOOM]
                }
            },
            transformTags: {
                // Set the "rel" attribute for <a> tags to "nofollow".
                a: sanitize_html_1.default.simpleTransform('a', { rel: 'nofollow' }),
                // Set the "disabled" attribute for <input> tags.
                input: sanitize_html_1.default.simpleTransform('input', { disabled: 'disabled' })
            },
            allowedSchemesByTag: {
                // Allow 'attachment:' img src (used for markdown cell attachments).
                img: sanitize_html_1.default.defaults.allowedSchemes.concat(['attachment'])
            },
            // Override of the default option, so we can skip 'src' attribute validation.
            // 'src' Attributes are validated to be URIs, which does not allow for embedded (image) data.
            // Since embedded data is no longer deemed to be a threat, validation can be skipped.
            // See https://github.com/jupyterlab/jupyterlab/issues/5183
            allowedSchemesAppliedToAttributes: ['href', 'cite']
        };
    }
    /**
     * Sanitize an HTML string.
     *
     * @param dirty - The dirty text.
     *
     * @param options - The optional sanitization options.
     *
     * @returns The sanitized string.
     */
    sanitize(dirty, options) {
        return sanitize_html_1.default(dirty, Object.assign({}, this._options, (options || {})));
    }
}
/**
 * The default instance of an `ISanitizer` meant for use by user code.
 */
exports.defaultSanitizer = new Sanitizer();
