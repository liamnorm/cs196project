// const COLORS = ['#DA0000', '#CB5E00', '#998300', '#008430', '#006DCB', '#84004F', '#CB008B'];
// const HIGHLIGHT_COLORS = ["#A2003C", "#A02E00", "#576400", "#006273", "#1637A8", "#250033", "#860099"];

const GL_WINDOW_WIDTH = 500

const COLORS =           ['#FF0000', '#D77600', '#AD8E00', '#52B31E', '#008E07', '#008AC2', '#0002FE', '#85008A', '#D930A3', '#7B7B7B'];
const HIGHLIGHT_COLORS = ["#C20051", "#BE3F00", "#537000", "#008A56", "#005C62", "#003F9B", "#2E0075", "#350066", "#AA0099", "#42486E"];

const OPERATION_COLOR = 4;
const LOGIC_COLOR = 1;
const FLOW_COLOR = 2;
const BLOCK_HEIGHT = 30;
const ROUNDEDNESS = 15;
const SCALE = .75;
const PRINT_COLOR = 8;
const COLORING_COLOR = 9;
const VARYING_COLOR = 5;

const MARGIN_X = 8;
const MARGIN_Y = 4;
const STROKE_WEIGHT = 2;

const CONTACT_WIDTH = 100;
const CONTACT_HEIGHT = 20;

const CAP_WIDTH = 100;
const CAP_HEIGHT = 20;

const CLAMP_WIDTH = 20;
const CLAMP_HEIGHT = 20;

const EMPTY_CLAMP_HEIGHT = 20;

// var c = document.getElementById("canvas");
// var ctx = c.getContext("2d");

// let colors = {black: "#000000", red: "#b40022", brown: "#c9921b", orange: "#eba800", yellow: "#facd02", lime: "#cbe000", darkgreen: "#028b53", blue: "#0fb5c5", grey: "#9dc9d4", lightblue: "#cbe8f9", lavender: "#d6cade", skin: "#ffd3c7", white: "#ffffff"};

// let colors = ["#b40022", "#c9921b", "#eba800", "#facd02",  "#cbe000", "#028b53",  "#0fb5c5", "#9dc9d4",  "#cbe8f9", "#d6cade", "#ffd3c7"];


let hovered_block = -1;
let hovered_arg = -1;
let hovered_contact = -1;

let dragged_stack = -1;

let stack_being_run = -1;

const DEFAULT_SHADER_CODE = `fragColor = vec4(0.1, 0.1, 0.4, 1.0);`;

let shader_code = DEFAULT_SHADER_CODE;

let mouseX = 0;
let mouseY = 0;

var blocks = {};
var num_of_blocks = 0;

var stacks = [
    // [[0, "print", [1], ["Hello"], [10, 10]],
    // [1, "add", [2, 3], ["", ""]],
    // [2, "multiply", [-1, -1], [50, 40]],
    // [3, "subtract", [-1, -1], [30, 20]],
    // ],

    // [[4, "print", [-1], ["Hello!"], [100, 50]],
    // [5, "print", [-1], ["How are you?"]],
    // [6, "print", [-1], ["I am well"]]
    // ],

    // [[7, "red", [], [], [200, 40]],
    // [8, "orange", [], []],
    // [9, "yellow", [], []],
    // [10, "green", [], []],
    // [11, "blue", [-1, -1, -1], ["is", "best", "ever"]],
    // [12, "purple", [], []],
    // [13, "pink", [], []]
    // ],

    // [
    // [14, "color", [15, 16, 17, -1], ["0", "0", "0", "1"], [50, 300]],
    // [15, "x", [], []],
    // [16, "y", [], []],
    // [17, "sine", [18], [90]],
    // [18, "divide", [19, -1], ["0", "10"]],
    // [19, "timer", [], []]
    // ]

    // [[0, "color", [1, 2, 3, -1], ["0", "0", "0", "1"], [300, 300]],
    // [1, "x", [], []],
    // [2, "y", [], []],
    // [3, "sine", [4], [90]],
    // [4, "divide", [5, -1], ["0", "10"]],
    // [5, "timer", [], []]
    // ]
    [[0, "run", [-1, -1, -1, -1], [-1, -1, -1, -1], [400, 200]]]
]

//const BLOCK_LIBRARY = ["print", "color", "colorvalue", "red", "green", "blue", "add", "subtract", "multiply", "divide", "mod", "equal", "lessthan", "greaterthan", "sine", "cosine", "tangent", "and", "or", "not", "x", "y", "timer", "true", "false"];
const BLOCK_LIBRARY = ["run", "colorrgb", "color", "gradient", "checker", "shift", "setred", "setgreen", "setblue", "red", "green", "blue", "add", "subtract", "multiply", "divide", "x", "y", "centerdistance", "timer", "mousex", "mousey", "equal", "lessthan", "greaterthan"];


class Block {

    updateSize () {

        let width = 0;
        let height = BLOCK_HEIGHT * SCALE;
        height += MARGIN_Y * 2 * SCALE;

        let arg_num = 0;
        for (let textpart = 0; textpart < this.skeleton.length; textpart++) {
            if (this.skeleton[textpart] != 0) {
                this.text[textpart] = this.textArgs[arg_num];
                arg_num += 1;
            }
            this.textobjects[textpart].text(this.text[textpart]);
        }

        // color block when running code

        this.highlighted = this.block_stack == stack_being_run;

        if (this.clamp_parent != -1) {
            if (blocks[this.clamp_parent].highlighted) {
                this.highlighted = true;
            }
        }
        if (this.clamp_parent2 != -1) {
            if (blocks[this.clamp_parent2].highlighted) {
                this.highlighted = true;
            }
        }

        if (this.highlighted) {
            this.rectobject.stroke('yellow');
            if (this.cap) {
                this.capobject.stroke('yellow');
            }
            if (this.blocktype == 2 || this.blocktype == 3) {
                this.bottomclampobject.stroke('yellow');
                this.sideclampobject.stroke('yellow');
                if (this.blocktype == 3) {
                    this.middleclampobject.stroke('yellow');
                }
            }
        } else {
            this.rectobject.stroke(HIGHLIGHT_COLORS[this.color]);
            if (this.cap) {
                this.capobject.stroke(HIGHLIGHT_COLORS[this.color]);
            }
            if (this.blocktype == 2 || this.blocktype == 3) {
                this.bottomclampobject.stroke(HIGHLIGHT_COLORS[this.color]);
                this.sideclampobject.stroke(HIGHLIGHT_COLORS[this.color]);
                if (this.blocktype == 3) {
                    this.middleclampobject.stroke(HIGHLIGHT_COLORS[this.color]);
                }
            }
        }

        // hover highlight
        let argnum = 0;
        for (let i = 0; i < this.skeleton.length; i++) {
            this.argboxobjects[i].stroke(HIGHLIGHT_COLORS[this.color]);
            if (this.skeleton[i] == 2) {
                this.argboxobjects[i].fill(string_to_color(this.text[i]));
            }
            if (hovered_block == this.id && stacks[dragged_stack] != null) {
                    if (blocks[stacks[dragged_stack][0][0]].blocktype == 1) {
                        if (argnum == hovered_arg) {
                            this.argboxobjects[i].stroke('cyan');
                        }
                    }
            }
            if (this.skeleton[i] != 0) {argnum += 1;}
        }

        let max_child_height = 0;
        let child_num = 0;
        for (let c = 0; c < this.skeleton.length; c++) {
            if (this.skeleton[c] != 0) {
                this.textobjects[c].fontStyle('normal');
                let child = this.children[child_num];
                if (child != null && child != -1) {
                    blocks[child].updateSize();
                    this.textwidths[c] = blocks[child].width - 2 * MARGIN_X * SCALE;
                    width += blocks[child].width;
                    if (blocks[child].height > max_child_height) {
                        max_child_height = blocks[child].height;
                        height = max_child_height + 2 * MARGIN_Y * SCALE;
                    }
                } else {
                    let default_text_length = this.textobjects[c].width();
                    this.textwidths[c] = default_text_length;
                    width += this.textwidths[c];
                    width += 2 * MARGIN_X * SCALE;
                }
                child_num += 1;
            } else {
                this.textobjects[c].fontStyle('bold');
                width += this.textwidths[c];
                width += 2 * MARGIN_X * SCALE;
            }
        }

        width += 2 * MARGIN_X * SCALE;
        this.width = width;
        this.height = height;
        if (this.blocktype == 2 || this.blocktype == 3) {
            if (this.clamped_block != -1) {
                this.height_with_clamp = height + stackheight(blocks[this.clamped_block].block_stack);
            } else {
                this.height_with_clamp = height + EMPTY_CLAMP_HEIGHT * SCALE;
            }
            this.height_with_clamp += CLAMP_HEIGHT * SCALE;
                this.height_with_first_clamp = this.height_with_clamp;
            if (this.blocktype == 3) {
                this.height_with_clamp = this.height_with_first_clamp;
                if (this.clamped_block2 != -1) {
                    this.height_with_clamp += stackheight(blocks[this.clamped_block2].block_stack);
                } else {
                    this.height_with_clamp += EMPTY_CLAMP_HEIGHT * SCALE;
                }
                this.height_with_clamp += CLAMP_HEIGHT * SCALE;
            }
        } else {
            this.height_with_clamp = height;
            this.height_with_first_clamp = height;
        }
        this.rectobject.width(this.width);
        this.rectobject.height(this.height);
        if (this.cap) {
            this.capobject.width(CAP_WIDTH * SCALE);
            this.capobject.height(CAP_HEIGHT * SCALE);
        }
        if (this.blocktype == 2 || this.blocktype == 3) {
            this.bottomclampobject.width(this.width);
            this.bottomclampobject.height(CLAMP_HEIGHT * SCALE);
            if (this.blocktype == 3) {
                this.middleclampobject.width(this.width);
                this.middleclampobject.height(CLAMP_HEIGHT * SCALE);
            }
            this.sideclampobject.width(CLAMP_WIDTH * SCALE);
            this.sideclampobject.height(this.height_with_clamp);
        }

        for (let a = 0; a < this.argboxobjects.length; a++) {
            let argbox = this.argboxobjects[a];
            argbox.width(this.textwidths[a] + 2 * MARGIN_X * SCALE);
            argbox.height(BLOCK_HEIGHT * SCALE);
        }

        this.bottom_contact_rect.y(this.height_with_clamp);
        this.top_clamp_contact_rect.y(this.height);
        this.bottom_clamp_contact_rect.y(this.height_with_first_clamp);
        this.top_clamp_contact_rect.x(CLAMP_WIDTH * SCALE);
        this.bottom_clamp_contact_rect.x(CLAMP_WIDTH * SCALE);

        this.top_contact_rect.hide();   
        this.bottom_contact_rect.hide();
        this.top_clamp_contact_rect.hide();
        this.bottom_clamp_contact_rect.hide();
        if (this.id == hovered_block && this.blocktype != 1) {
            switch(hovered_contact){
                case 1:
                    this.top_contact_rect.show(); break;
                case 2:
                    this.bottom_contact_rect.show(); break;
                case 3:
                    this.top_clamp_contact_rect.show(); break;
                case 4:
                    this.bottom_clamp_contact_rect.show(); break;
            }
        }

    }

    updateLocation() {

        if (this.block_stack != dragged_stack) {
            if (this.clamp_parent != -1) {
                let parent_block = blocks[this.clamp_parent];
                this.x = parent_block.x + CLAMP_WIDTH * SCALE;
                this.y = parent_block.y + parent_block.height;
            }
            else if (this.clamp_parent2 != -1) {
                let parent_block2 = blocks[this.clamp_parent2];
                this.x = parent_block2.x + CLAMP_WIDTH * SCALE;
                this.y = parent_block2.y + parent_block2.height_with_first_clamp;
            }
        }

        if (this.next != null) {
            if (blocks[this.next].blocktype != 1) {
                blocks[this.next].y = this.y + this.height_with_clamp;
                blocks[this.next].x = this.x;
            }
        }

        if (this.blocktype == 2 || this.blocktype == 3) {
            this.bottomclampobject.y(this.height_with_clamp - CLAMP_HEIGHT * SCALE);
            if (this.blocktype == 3) {
                this.middleclampobject.y(this.height_with_first_clamp - CLAMP_HEIGHT * SCALE);
            }
        }

        let childx = MARGIN_X;
        let child_num = 0;
        for (let c = 0; c < this.skeleton.length; c++) {
            if (this.skeleton[c] != 0) {
                let child = this.children[child_num];
                if (child != null && child != -1) {
                    blocks[child].y = this.y + (this.height / 2) - (blocks[child].height / 2);
                    blocks[child].x = this.x + childx;
                }
                child_num += 1;
            }
            childx += this.textwidths[c] + 2 * MARGIN_X * SCALE;
        }

        let argx = MARGIN_X;
        for (let a = 0; a < this.argboxobjects.length; a++) {
            let argbox = this.argboxobjects[a];
            argbox.x(argx);
            argbox.y((this.height - BLOCK_HEIGHT * SCALE) / 2);
            argx += this.textwidths[a] + 2 * MARGIN_X * SCALE;
        }

        let textx = 2 * MARGIN_X * SCALE;
        for (let a = 0; a < this.textobjects.length; a++) {
            let text = this.textobjects[a];
            text.x(textx);
            text.y(this.height / 2 - 10 * SCALE);
            textx += this.textwidths[a] + 2 * MARGIN_X * SCALE;
        }

        if (this.cap) {
            this.capobject.x(0);
            this.capobject.y(0- CAP_HEIGHT * SCALE);
        }

        this.groupobject.x(this.x);
        this.groupobject.y(this.y);

    }

    prepArgs() {
        this.args = [];
        let child_num = 0;
        for (let i = 0; i < this.skeleton.length; i++) {
            if (this.skeleton[i] != 0) {
                if (this.children[child_num] == null || this.children[child_num] == -1) {
                    this.args.push(this.text[i]);
                } else {
                    this.args.push(blocks[this.children[child_num]].eval());
                }
                child_num += 1;
            }
        }
    }

    block_name = "block";

    color = 1;

    blocktype = 0;

    cap = false;

    shadercode_template = [];

    top_contact_rect = null;
    bottom_contact_rect = null;
    top_clamp_contact_rect = null;
    bottom_clamp_contact_rect = null;

    constructor(id) {
        this.id = id
        this.x = 0;
        this.y = 0;
        this.height = BLOCK_HEIGHT;
        this.width = BLOCK_HEIGHT;
        this.children = [];
        this.textArgs = [];
        this.text = ["text", "arg"];
        this.textwidths = [0, 0];
        this.textobjects = [];
        this.argboxobjects = [];
        this.rectobject = null;
        this.capobject = null;
        this.next = null;
        this.dragged = false;
        this.groupobject = null;
        this.block_stack = 0;
        this.library_block = false;
        this.prev_x = this.x;
        this.prev_y = this.y;
        this.clamped_block = -1;
        this.clamped_block2 = -1;
        this.bottomclampobject = null;
        this.sideclampobject = null;
        this.height_with_clamp = 0;
        this.height_with_first_clamp = 0;
        this.clamp_parent = -1;
        this.clamp_parent2 = -1;
        this.highlighted = false;
    }
    
    skeleton = [0]
    
    eval (args) { return 0}
}
class StackBlock extends Block {
    blocktype = 0;

    doNext() {
        blocks[this.next].eval();
    }
}
class ArgBlock extends Block {
    blocktype = 1;
}
class BoolArgBlock extends ArgBlock {
    blocktype = 1;
}

class ClampBlock extends StackBlock {
    blocktype = 2;

    doNext() {
        blocks[this.next].eval();
    }
}

class DoubleClampBlock extends StackBlock {
    blocktype = 3;

    doNext() {
        blocks[this.next].eval();
    }
}

class CapBlock extends StackBlock {
    cap = true;
}

class RunBlock extends CapBlock {
    block_name = "run";
    color = PRINT_COLOR;
    skeleton = [0];
    text = ["run this code:"];
    shadercode_template = [""];

    eval () {
        return null;
    }
}
class PrintBlock extends StackBlock {
    block_name = "print";
    color = PRINT_COLOR;
    skeleton = [0, 1];
    text = ["print", "Hello!"];
    shadercode_template = ["//", "\n"];

    eval () {
        this.prepArgs();
        console.log(this.args[0]);
        return null;
    }
}
class ColorRGBBlock extends StackBlock {
    block_name = "colorrgb";
    color = COLORING_COLOR;
    skeleton = [0,1,0,1,0,1];
    text = ["set red", "0", "green", "0", "blue", "0"];
    //shadercode_template = ["fragColor = vec4(", ", ", ", ", ", ", ");\n"];
    shadercode_template = ["r = float(", "); g = float(", "); b = float(", ");\n"];
}
class ColorBlock extends StackBlock {
    block_name = "color";
    color = COLORING_COLOR;
    skeleton = [0,2];
    text = ["set color to", "#00ff00"];
    shadercode_template = ["fragColor = ", ";\n; r=fragColor.r; g=fragColor.g; b = fragColor.b;"];
}

class GradientBlock extends StackBlock {
    block_name = "gradient";
    color = COLORING_COLOR;
    skeleton = [0,2,0,2];
    text = ["gradient from ", "#ffff00", "to", "#00ffff"];
    shadercode_template = [
        "vec4 gradColor1 = ", 
        ";\n; vec4 gradColor2 = ", 
        `;\n; 
            r = gradColor2.r * coord.x + gradColor1.r * (1.0 - coord.x); 
            g = gradColor2.g * coord.x + gradColor1.g * (1.0 - coord.x); 
            b = gradColor2.b * coord.x + gradColor1.b * (1.0 - coord.x);` 
    ];
}
class CheckerBlock extends DoubleClampBlock {
    block_name = "checker";
    color = COLORING_COLOR;
    skeleton = [0,1,0,1];
    text = ["checker ", "4", "by", "4"];

    //shadercode_template = ["fragColor = vec4(", ", ", ", ", ", ", ");\n"];
    shadercode_template = ["if ((int(coord.x * float(", ")) % 2 == 0) != (int(coord.y * float(", ")) % 2 == 0))"];
}

class ShiftBlock extends StackBlock {
    block_name = "shift";
    color = COLORING_COLOR;
    skeleton = [0,1,0,1];
    text = ["shift x ", "0.2", " y ", "0"];
    shadercode_template = [
        "coord.x += float(", 
        ");\n coord.y += float(", 
        ");\n coord.x = coord.x - floor(coord.x); coord.y = coord.y - floor(coord.y);"
    ];
}
class ColorValueBlock extends ArgBlock {
    block_name = "colorvalue";
    color = COLORING_COLOR;
    skeleton = [1];
    text = ["red"];
    shadercode_template = [""];
}

class XBlock extends ArgBlock {
    block_name = "x";
    color = VARYING_COLOR;
    skeleton = [0];
    text = ["X"];
    shadercode_template = ["coord.x"];
}
class YBlock extends ArgBlock {
    block_name = "y";
    color = VARYING_COLOR;
    skeleton = [0];
    text = ["Y"];
    shadercode_template = ["coord.y"];
}
class CenterDistanceBlock extends ArgBlock {
    block_name = "centerdistance";
    color = VARYING_COLOR;
    skeleton = [0];
    text = ["distance to center"];
    shadercode_template = ["sqrt((coord.x - 0.5) * (coord.x - 0.5) + (coord.y - 0.5) * (coord.y - 0.5))"];
}
class TimerBlock extends ArgBlock {
    block_name = "timer";
    color = VARYING_COLOR;
    skeleton = [0];
    text = ["timer"];
    shadercode_template = ["frame"];
}

class MouseXBlock extends ArgBlock {
    block_name = "mousex";
    color = PRINT_COLOR;
    skeleton = [0];
    text = ["mouse X"];
    shadercode_template = ["mouse.x"];
}
class MouseYBlock extends ArgBlock {
    block_name = "mousey";
    color = PRINT_COLOR;
    skeleton = [0];
    text = ["mouse Y"];
    shadercode_template = ["mouse.y"];
}

class SetRedBlock extends StackBlock {
    block_name = "setred";
    color = 0;
    skeleton = [0, 1];
    text = ["set red", "1"];
    shadercode_template = ["r = float(", ");\n"];
}
class RedBlock extends ArgBlock {
    block_name = "red";
    color = 0;
    skeleton = [0];
    text = ["red"];
    shadercode_template = ["r"];
}

class OrangeBlock extends StackBlock {
    block_name = "orange";
    color = 1;
    skeleton = [0];
    text = ["orange"];
    shadercode_template = ["orange"];
}

class YellowBlock extends StackBlock {
    block_name = "yellow";
    color = 2;
    skeleton = [0];
    text = ["yellow"];
    shadercode_template = ["yellow"];
}

class SetGreenBlock extends StackBlock {
    block_name = "setgreen";
    color = 4;
    skeleton = [0, 1];
    text = ["set green", "1"];
    shadercode_template = ["g = float(", ");\n"];
}

class GreenBlock extends ArgBlock {
    block_name = "green";
    color = 4;
    skeleton = [0];
    text = ["green"];
    shadercode_template = ["g"];
}

class SetBlueBlock extends StackBlock {
    block_name = "setblue";
    color = 6;
    skeleton = [0, 1];
    text = ["set blue", "1"];
    shadercode_template = ["b = float(", ");\n"];
}

class BlueBlock extends ArgBlock {
    block_name = "blue";
    color = 6;
    skeleton = [0];
    text = ["blue"];
    shadercode_template = ["b"];
}

class PurpleBlock extends StackBlock {
    block_name = "purple";
    color = 5;
    skeleton = [0];
    text = ["purple"];
    shadercode_template = ["purple"];
}

class PinkBlock extends StackBlock {
    block_name = "pink";
    color = 6;
    skeleton = [0];
    text = ["pink"];
    shadercode_template = ["pink"];
}

class TransparencyBlock extends StackBlock {
    block_name = "transparency";
    color = 9;
    skeleton = [0, 1];
    text = ["set transparency ", "0.5"];
    shadercode_template = ["a = float(", ");\n"];
}

class AddBlock extends ArgBlock {
    block_name = "add";
    color = OPERATION_COLOR
    skeleton = [1, 0, 1];
    text = [" ", "+", " "];
    shadercode_template = ["_add(", ",", ")"];

    eval () {
        this.prepArgs();
        return parseFloat(this.args[0]) + parseFloat(this.args[1]);
    }
}

class SubtractBlock extends ArgBlock {
    block_name = "subtract";
    color = OPERATION_COLOR
    skeleton = [1, 0, 1];
    text = [" ", "-", " "];
    shadercode_template = ["_subtract(", ", ", ")"];

    eval () {
        this.prepArgs();
        return parseFloat(this.args[0]) - parseFloat(this.args[1]);
    }
}

class MultiplyBlock extends ArgBlock {
    block_name = "multiply";
    color = OPERATION_COLOR
    skeleton = [1, 0, 1];
    text = [" ", "*", " "];
    shadercode_template = ["_multiply(", ", ", ")"];

    eval () {
        this.prepArgs();
        return parseFloat(this.args[0]) * parseFloat(this.args[1]);
    }
}
class DivideBlock extends ArgBlock {
    block_name = "divide";
    color = OPERATION_COLOR
    skeleton = [1, 0, 1];
    text = [" ", "/", " "];

    shadercode_template = ["_divide(", ", ", ")"];

    eval () {
        this.prepArgs();
        return parseFloat(this.args[0]) / parseFloat(this.args[1]);
    }
}
class ModBlock extends ArgBlock {
    block_name = "mod";
    color = OPERATION_COLOR
    skeleton = [1, 0, 1];
    text = [" ", "%", " "];

    shadercode_template = ["_modulus(", ", ", ")"];

    eval () {
        this.prepArgs();
        return parseFloat(this.args[0]) % parseFloat(this.args[1]);
    }
}
class SineBlock extends ArgBlock {
    block_name = "sine";
    color = OPERATION_COLOR
    skeleton = [0, 1];
    text = ["sine", "90"];
    shadercode_template = ["_sin(", ")"];

    eval () {
        this.prepArgs();
        return Math.sin(parseFloat(this.args[0]));
    }
}
class CosineBlock extends ArgBlock {
    block_name = "cosine";
    color = OPERATION_COLOR
    skeleton = [0, 1];
    text = ["cosine", "90"];
    shadercode_template = ["_cos(", ")"];

    eval () {
        this.prepArgs();
        return Math.cos(parseFloat(this.args[0]));
    }
}
class TangentBlock extends ArgBlock {
    block_name = "tangent";
    color = OPERATION_COLOR
    skeleton = [0, 1];
    text = ["tangent", "90"];
    shadercode_template = ["_tan(", ")"];

    eval () {
        this.prepArgs();
        return Math.tan(parseFloat(this.args[0]));
    }
}
class EqualBlock extends ArgBlock {
    block_name = "equal";
    color = OPERATION_COLOR
    skeleton = [1, 0, 1, 0];
    text = [" ", "=", " ", "?"];
    shadercode_template = ["(float(", ") == float(", "))"];

    eval () {
        this.prepArgs();
        return parseFloat(this.args[0]) == parseFloat(this.args[1]);
    }
}

class LessThanBlock extends ArgBlock {
    block_name = "lessthan";
    color = OPERATION_COLOR
    skeleton = [1, 0, 1, 0];
    text = [" ", "<", " ", "?"];
    shadercode_template = ["(float(", ") < float(", "))"];

    eval () {
        this.prepArgs();
        return parseFloat(this.args[0]) < parseFloat(this.args[1]);
    }
}
class GreaterThanBlock extends ArgBlock {
    block_name = "lessthan";
    color = OPERATION_COLOR
    skeleton = [1, 0, 1, 0];
    text = [" ", ">", " ", "?"];
    shadercode_template = ["(float(", ") > float(", "))"];

    eval () {
        this.prepArgs();
        return parseFloat(this.args[0]) > parseFloat(this.args[1]);
    }
}
class AndBlock extends BoolArgBlock {
    block_name = "and";
    color = LOGIC_COLOR
    skeleton = [1, 0, 1];
    text = ["false", "and", "false"];
    shadercode_template = ["(", " && ", ")"];

    eval () {
        this.prepArgs();
        return this.args[0] && this.args[1];
    }
}
class OrBlock extends BoolArgBlock {
    block_name = "or";
    color = LOGIC_COLOR
    skeleton = [1, 0, 1];
    text = ["false", "or", "false"];
    shadercode_template = ["(", " || ", ")"];

    eval () {
        this.prepArgs();
        return this.args[0] || this.args[1];
    }
}
class NotBlock extends BoolArgBlock {
    block_name = "not";
    color = LOGIC_COLOR
    skeleton = [0, 1];
    text = ["not", "false"];
    shadercode_template = ["(!", ")"];

    eval () {
        this.prepArgs();
        return !this.args[0];
    }
}
class TrueBlock extends BoolArgBlock {
    block_name = "true";
    color = 0
    skeleton = [0];
    text = ["true"];
    shadercode_template = ["(true)"];

    eval () {
        this.prepArgs();
        return true;
    }
}
class FalseBlock extends BoolArgBlock {
    block_name = "false";
    color = 0
    skeleton = [0];
    text = ["false"];
    shadercode_template = ["(false)"];

    eval () {
        this.prepArgs();
        return false;
    }
}
class IfBlock extends ClampBlock {
    block_name = "if";
    color = FLOW_COLOR;
    skeleton = [0, 1, 0];
    text = ["if", "true", "then"];
    shadercode_template = ["if (_bool(", "))"];

    eval () {
        this.prepArgs();
        if (this.args[0]) {blocks[this.clamped_block].eval()} else {}; 
        return null;
    }
}

class IfElseBlock extends DoubleClampBlock {
    block_name = "ifelse";
    color = FLOW_COLOR;
    skeleton = [0, 1, 0];
    text = ["if", "true", "then, else"];
    shadercode_template = ["if (_bool(", "))"];

    eval () {
        this.prepArgs();
        if (this.args[0]) {blocks[this.clamped_block].eval()} else {blocks[this.clamped_block2].eval()}; 
        return null;
    }
}

var width = window.innerWidth - GL_WINDOW_WIDTH;
var height = window.innerHeight;

var stage = new Konva.Stage({
  container: 'container',
  width: width,
  height: height,
});

var layer = new Konva.Layer();

let background = new Konva.Rect({
    fill: "#222233",
    width: width,
    height: height
});
layer.add(background);

let sidebar = new Konva.Rect({
    fill: "#FFFFFF",
    opacity: 0.2,
    width: 400 * SCALE,
    height: height
});
layer.add(sidebar);

let library_text = new Konva.Text({
    x: 50 * SCALE,
    y: 10 * SCALE,
    text: "LIBRARY",
    fontStyle: 'bold',
    fontSize: 30 * SCALE,
    fontFamily: 'Helvetica',
    fill: "#FFFFFF"
});
layer.add(library_text);


//get total number of blocks in stack

let i = 0;
let stacklength = 0;
for (let stack of stacks) {
    for (let _ of stack) {
        stacklength += 1;
    }
}

// add dummy library blocks

function get_block_ids() {
    let block_ids = [];
    for (let stack of stacks) {
        for (let stackitem of stack) {
            block_ids.push(stackitem[0]);
        }
    }
    return block_ids;
}

let new_id = 0;
for (let block_name of BLOCK_LIBRARY) {

    let block_ids = get_block_ids();
    while (block_ids.includes(new_id)) {
        new_id += 1;
        block_ids = get_block_ids();
    }
    stacks.push([[new_id, block_name, [-1, -1, -1, -1, -1], [], [50, i * 36 + 50], true]]);
    i += 1;
}

// create block objects for each item in the stack

// let y = 0;
// for (let stack of stacks) {
//     for (let stackitem of stack) {
//         let blockname = stackitem[1];
//         let textArgs = stackitem[3];
//         let spawnx = 100;
//         let spawny = y;
//         if (stackitem[4] != null) {
//             spawnx = stackitem[4][0];
//             spawny = stackitem[4][1];
//         }
//         spawnBlock(blockname, textArgs, spawnx, spawny);
//         y += 16;
//     }
// }

function string_to_color(string) {
    return string;
}

function HEXToVBColor(rrggbb) {
    let r = (parseInt("0x" + rrggbb.substr(0, 2), 16) / 255).toString();
    let g = (parseInt("0x" + rrggbb.substr(2, 2), 16) / 255).toString();
    let b = (parseInt("0x" + rrggbb.substr(4, 2), 16) / 255).toString();
    return r + ", " + g + ", " + b + "";
}

function stackheight (s) {
    let height = 0;
    for (let b = 0; b < stacks[s].length; b++) {
        let block_id = stacks[s][b][0];
        blocks[block_id].updateSize();
        if (blocks[block_id].blocktype == 0) {
            height += blocks[block_id].height_with_clamp;
        }
    }
    return height;
}

function blockObjectFromName(block_name) {
    let b;
    switch (block_name) {
        case "run": b = new RunBlock(); break;
        case "print": b = new PrintBlock(); break;
        case "colorrgb": b = new ColorRGBBlock(); break;
        case "color": b = new ColorBlock(); break;
        case "checker": b = new CheckerBlock(); break;
        case "gradient": b = new GradientBlock(); break;
        case "shift": b = new ShiftBlock(); break;
        case "colorvalue": b = new ColorValueBlock(); break;
        case "x": b = new XBlock(); break;
        case "y": b = new YBlock(); break;
        case "centerdistance": b = new CenterDistanceBlock(); break;
        case "timer": b = new TimerBlock(); break;
        case "mousex": b = new MouseXBlock(); break;
        case "mousey": b = new MouseYBlock(); break;
        case "red": b = new RedBlock(); break;
        case "orange": b = new OrangeBlock(); break;
        case "yellow": b = new YellowBlock(); break;
        case "green": b = new GreenBlock(); break;
        case "blue": b = new BlueBlock(); break;
        case "purple": b = new PurpleBlock(); break;
        case "pink": b = new PinkBlock(); break;
        case "setred": b = new SetRedBlock(); break;
        case "setgreen": b = new SetGreenBlock(); break;
        case "setblue": b = new SetBlueBlock(); break;
        case "transparency": b = new TransparencyBlock(); break;
        case "add": b = new AddBlock(); break;
        case "subtract": b = new SubtractBlock(); break;
        case "multiply": b = new MultiplyBlock(); break;
        case "divide": b = new DivideBlock(); break;
        case "mod": b = new ModBlock(); break;
        case "sine": b = new SineBlock(); break;
        case "cosine": b = new CosineBlock(); break;
        case "tangent": b = new TangentBlock(); break;
        case "and": b = new AndBlock(); break;
        case "or": b = new OrBlock(); break;
        case "not": b = new NotBlock(); break;
        case "true": b = new TrueBlock(); break;
        case "false": b = new FalseBlock(); break;
        case "if": b = new IfBlock(); break;
        case "ifelse": b = new IfElseBlock(); break;
        case "equal": b = new EqualBlock(); break;
        case "lessthan": b = new LessThanBlock(); break;
        case "greaterthan": b = new GreaterThanBlock(); break;

        default: b = new Block();
    }
    return b;
}

// function spawnBlock (blockname, textArgs, x, y) {
//     let b = blockObjectFromName(blockname);

//     b.id = blocks.length;
//     if (textArgs != null) {
//         b.textArgs = textArgs;
//     } else {
//         b.textArgs = [];
//         for (let t = 0; t < b.skeleton.length; t++) {
//             if (b.skeleton[t] == 1) {b.textArgs.push(b.text[t]);}
//         }
//     }
//     b.x = x;
//     b.y = y;

//     if (b.id >= stacklength) {
//         b.library_block = true;
//     }

//     blocks.push(b);
// }

function run_main_stack() {
    for (let s = 0; s < stacks.length; s++) {
        let block = blocks[stacks[s][0][0]];
        if (block.block_name == "run" && !stacks[s][0][5]) {
            stack_being_run = s;
            console.log(stack_being_run);
        }
    }
}

function fullyCreateBlock(block_name, id, textArgs, x, y, library_block=false) {
    // don't modify the stacks!
    let block = blockObjectFromName(block_name);
    block.id = id;
    block.x = x;
    block.y = y;
    block.library_block = library_block;

    if (textArgs.length != 0) {
        block.textArgs = [];
        for (let textArg of textArgs) {
            block.textArgs.push(textArg.toString())
        }
    } else {
        block.textArgs = [];
        for (let s = 0; s < block.skeleton.length; s++) {
            if (block.skeleton[s] != 0) {
                block.textArgs.push(block.text[s]);
            }
        }
    }
    blocks[id] = block;
    num_of_blocks += 1;

    let block_stack = -1;

    for (let s = 0; s < stacks.length; s++) {
        for (let stackitem of stacks[s]) {
            if (stackitem[0] == id) {block_stack = s;}
        }
    }

    block.block_stack = block_stack;

    // set block's next value?

    let textwidths = [];
    let textobjects = [];
    let argboxobjects = [];
    let a = 0;
    for (t = 0; t < block.text.length; t++) {
        let textfill = (block.skeleton[t] != 0) ? 'black' : 'white';
        let textNode = new Konva.Text({
            text: block.text[t],
            fontSize: 20 * SCALE,
            fontFamily: 'Helvetica',
            fill: textfill,
        })

        textNode.block = block;
        textNode.text_id = t;
        textNode.arg_num = a;

        textNode.writing = function () {
                        // hide text node and transformer:
                        textNode.hide();
    
                        // create textarea over canvas with absolute position
                        // first we need to find position for textarea
                        // how to find it?
                
                        // at first lets find position of text node relative to the stage:
                        var textPosition = textNode.absolutePosition();
                
                        // so position of textarea will be the sum of positions above:
                        var areaPosition = {
                          x: stage.container().offsetLeft + textPosition.x,
                          y: stage.container().offsetTop + textPosition.y,
                        };
                
                        // create textarea and style it
                        var textarea = document.createElement('textarea');
                        document.body.appendChild(textarea);
                
                        // apply many styles to match text on canvas as close as possible
                        // remember that text rendering on canvas and on the textarea can be different
                        // and sometimes it is hard to make it 100% the same. But we will try...
                        textarea.value = textNode.text();
                        textarea.style.position = 'absolute';
                        textarea.style.top = areaPosition.y + 'px';
                        textarea.style.left = areaPosition.x + 'px';
                        textarea.style.width = textNode.width() - textNode.padding() * 2 + 'px';
                        textarea.style.height =
                          textNode.height() - textNode.padding() * 2 + 5 + 'px';
                        textarea.style.fontSize = textNode.fontSize() + 'px';
                        textarea.style.border = 'none';
                        textarea.style.padding = '0px';
                        textarea.style.margin = '0px';
                        textarea.style.overflow = 'hidden';
                        textarea.style.background = 'none';
                        textarea.style.outline = 'none';
                        textarea.style.resize = 'none';
                        textarea.style.lineHeight = textNode.lineHeight();
                        textarea.style.fontFamily = textNode.fontFamily();
                        textarea.style.fontStyle = textNode.fontStyle();
                        textarea.style.transformOrigin = 'left top';
                        textarea.style.textAlign = textNode.align();
                        textarea.style.color = textNode.fill();
                        var transform = '';
                
                        var px = 0;
                        // also we need to slightly move textarea on firefox
                        // because it jumps a bit
                        var isFirefox =
                          navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
                        if (isFirefox) {
                          px += 2 + Math.round(textNode.fontSize() / 20);
                        }
                        transform += 'translateY(-' + px + 'px)';
                
                        textarea.style.transform = transform;
                
                        // reset height
                        textarea.style.height = 'auto';
                        // after browsers resized it we can set actual value
                        textarea.style.height = textarea.scrollHeight + 3 + 'px';
                
                        textarea.focus();
                
                        function removeTextarea() {
                          if (textarea.parentNode != null) {
                            textarea.parentNode.removeChild(textarea);
                          }
                          window.removeEventListener('click', handleOutsideClick);
                          textNode.show();
                        }
                
                        function setTextareaWidth(newWidth) {
                          if (!newWidth) {
                            // set width for placeholder
                            if (textNode.placeholder != null) {
                                newWidth = textNode.placeholder.length * textNode.fontSize();
                            }
                          }
                          // some extra fixes on different browsers
                          var isSafari = /^((?!chrome|android).)*safari/i.test(
                            navigator.userAgent
                          );
                          var isFirefox =
                            navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
                          if (isSafari || isFirefox) {
                            newWidth = Math.ceil(newWidth);
                          }
                
                          var isEdge =
                            document.documentMode || /Edge/.test(navigator.userAgent);
                          if (isEdge) {
                            newWidth += 1;
                          }
                          textarea.style.width = newWidth + 'px';
                        }
                
                        textarea.addEventListener('keydown', function (e) {
                          // hide on enter
                          // but don't hide on shift + enter
                        //   if (e.keyCode === 13 && !e.shiftKey) {
                        //     textNode.text(textarea.value);
                        //     removeTextarea();
                        //   }
                          // on esc do not set value back to node
                        //   if (e.keyCode === 27) {
                        //     removeTextarea();
                        //   }
                        });
                
                        textarea.addEventListener('keydown', function (e) {
                            let scale = textNode.getAbsoluteScale().x + 10;
                            setTextareaWidth(textNode.width() * scale);
                            textarea.style.height = 'auto';
                            textarea.style.height =
                                textarea.scrollHeight + textNode.fontSize() + 'px';
            
                            textNode.text(textarea.value);
                            textNode.block.textArgs[textNode.arg_num] = textarea.value;

                            updateShaderCode();
                            updateBlocks();
                        });
                
                        function handleOutsideClick(e) {
                          if (e.target !== textarea) {
                            textNode.text(textarea.value);
                            textNode.block.textArgs[textNode.arg_num] = textarea.value;
                            updateBlocks();
                            removeTextarea();
                          }
                        }
                        setTimeout(() => {
                          window.addEventListener('click', handleOutsideClick);
                        });
                        setTimeout(() => {
                          window.addEventListener('mousedown', handleOutsideClick);
                        });
                    }

        if (block.skeleton[t] != 0) {
            a += 1;
            textNode.on('click tap', () => {
                textNode.writing();
            });
        }

        textwidths.push(textNode.width());
        textobjects.push(textNode);

        let argfill = COLORS[block.color];
        let argweight = 0;
        let opacity = 0;
        if (block.skeleton[t] != 0) {
            if (block.skeleton[t] == 2)
                {argfill = string_to_color(block.text[t]);} 
            else
                {argfill = 'white';}
            argweight = STROKE_WEIGHT;
            opacity = 1;
        }
        let argbox = new Konva.Rect({
            width: block.textwidths[t],
            height: BLOCK_HEIGHT * SCALE,
            fill: argfill,
            stroke: HIGHLIGHT_COLORS[block.color],
            strokeWidth: argweight,
            opacity: opacity,
            cornerRadius: ROUNDEDNESS * SCALE,
        });
        argboxobjects.push(argbox);

    }

    let top_contact_rect = new Konva.Rect({
        y: -CONTACT_HEIGHT * SCALE,
        width: CONTACT_WIDTH * SCALE,
        height: CONTACT_HEIGHT * SCALE,
        fill: "#FFFFFF",
        opacity: 0.5,
        cornerRadius: 0,
    });

    let bottom_contact_rect = new Konva.Rect({
        width: CONTACT_WIDTH * SCALE,
        height: CONTACT_HEIGHT * SCALE,
        fill: "#FFFFFF",
        opacity: 0.5,
        cornerRadius: 0,
    });

    let top_clamp_contact_rect = new Konva.Rect({
        y: -CONTACT_HEIGHT * SCALE,
        width: CONTACT_WIDTH * SCALE,
        height: CONTACT_HEIGHT * SCALE,
        fill: "#FFFFFF",
        opacity: 0.5,
        cornerRadius: 0,
    });

    let bottom_clamp_contact_rect = new Konva.Rect({
        width: CONTACT_WIDTH * SCALE,
        height: CONTACT_HEIGHT * SCALE,
        fill: "#FFFFFF",
        opacity: 0.5,
        cornerRadius: 0,
    });

    block.top_contact_rect = top_contact_rect;
    block.bottom_contact_rect = bottom_contact_rect;
    block.top_clamp_contact_rect = top_clamp_contact_rect;
    block.bottom_clamp_contact_rect = bottom_clamp_contact_rect;

    block.textwidths = textwidths;
    block.textobjects = textobjects;
    block.argboxobjects = argboxobjects;

    let r = ROUNDEDNESS * SCALE;
    let cornerRadius = (block.blocktype != 1) ? [0,r,r,0] : r;
    let rect = new Konva.Rect({
        fill: COLORS[block.color],
        stroke: HIGHLIGHT_COLORS[block.color],
        strokeWidth: STROKE_WEIGHT,
        cornerRadius: cornerRadius,
    });
    block.rectobject = rect;

    if (block.cap) {
        let cap = new Konva.Rect({
            fill: COLORS[block.color],
            stroke: HIGHLIGHT_COLORS[block.color],
            strokeWidth: STROKE_WEIGHT,
            cornerRadius: [r, r, 0, 0],
        });
        block.capobject = cap;
    }

    if (block.blocktype == 2 || block.blocktype == 3) {
        let bottomclamprect = new Konva.Rect({
            fill: COLORS[block.color],
            stroke: HIGHLIGHT_COLORS[block.color],
            strokeWidth: STROKE_WEIGHT,
            cornerRadius: cornerRadius,
        });
        block.bottomclampobject = bottomclamprect;
        let sideclamprect = new Konva.Rect({
            fill: COLORS[block.color],
            stroke: HIGHLIGHT_COLORS[block.color],
            strokeWidth: STROKE_WEIGHT,
        });
        block.sideclampobject = sideclamprect;

        if (block.blocktype == 3) {
            let middleclamprect = new Konva.Rect({
            fill: COLORS[block.color],
            stroke: HIGHLIGHT_COLORS[block.color],
            strokeWidth: STROKE_WEIGHT,
        });
        block.middleclampobject = middleclamprect;
        }
    }
    // can (and should ) be optimized
    let blockgroup = new Konva.Group({draggable: true});
    block.groupobject = blockgroup;

    //block.updateSize();
    //block.updateLocation();

    if (block.blocktype == 2 || block.blocktype == 3) {
        blockgroup.add(block.sideclampobject);
        blockgroup.add(block.bottomclampobject);
        if (block.blocktype == 3) {
            blockgroup.add(block.middleclampobject);
        }
    }

    if (block.cap) {
        blockgroup.add(block.capobject);
    }

    blockgroup.add(block.rectobject);

    for (const argbox of block.argboxobjects){
        argbox.blockobject = block;
        blockgroup.add(argbox);
    }
    for (const text of block.textobjects){
        text.blockobject = block;
        blockgroup.add(text);
    }

    blockgroup.add(block.top_contact_rect);
    blockgroup.add(block.bottom_contact_rect);
    blockgroup.add(block.top_clamp_contact_rect);
    blockgroup.add(block.bottom_clamp_contact_rect);

    blockgroup.block_stack = block.block_stack;
    blockgroup.block_id = block.id;

    blockgroup.on('mouseover', function () {
        document.body.style.cursor = 'pointer';
    });

    blockgroup.on('mouseout', function () {
        document.body.style.cursor = 'default';
    });

    blockgroup.on('dragmove', function () {

        blocks[this.block_id].dragged = true;
        dragged_stack = this.block_stack;

        this.offsetX(0);
        this.offsetY(0);
        blocks[this.block_id].x = this.absolutePosition().x;
        blocks[this.block_id].y = this.absolutePosition().y;

        var stacklength = stacks[this.block_stack].length;
        for (var b2 = 0; b2 < stacklength; b2++) {
            //calculate location of each block
            var block2 = blocks[stacks[this.block_stack][b2][0]];
            block2.updateLocation();

            // move stack to front layer!
            block2.groupobject.zIndex(num_of_blocks + 2);
        }

        findHoveredBlock();
        for (const [id, block] of Object.entries(blocks)) {
            block.updateSize();
        }
        updateBlocks();
    });

    blockgroup.on('dragend', function () {
        // iterate to find location of block in stack?


        // duplicate library blocks
        if (blocks[this.block_id].library_block) {
            let lib_block = blocks[this.block_id];
            lib_block.library_block = false;
            let new_block_id = 0;
            while (new_block_id in blocks) {
                new_block_id += 1;
            }
            let new_block_name = lib_block.block_name;
            stacks.push([[new_block_id, new_block_name, [-1, -1, -1, -1, -1], [], [], true]]);
            stacks[this.block_stack][0][5] = false;

            //creates new library block at location it just once was
            fullyCreateBlock(new_block_name, new_block_id, [], lib_block.prev_x, lib_block.prev_y, true);
            
            updateBlocks();
            updateShaderCode();

            // create a new block
        }

        // separate off from within clamp

        if (this.clamp_parent != -1 && this.clamp_parent != null) {
            blocks[this.clamp_parent].clamped_block = -1;
            this.clamp_parent = -1
        }

        if (this.clamp_parent2 != -1 && this.clamp_parent2 != null) {
            blocks[this.clamp_parent2].clamped_block2 = -1;
            this.clamp_parent2 = -1
        }

        // delete trashed blocks
        if (this.x() < 400 * SCALE) {

            function deleteStack (stack) {

                let num_blocks_deleted = stacks[stack].length;

                num_of_blocks -= num_blocks_deleted;
                for (let stackitem of stacks[stack]) {
                    let block_id = stackitem[0];
                    if (blocks[block_id].clamped_block != -1) {
                        let child = blocks[block_id].clamped_block;
                        let substack = blocks[child].block_stack;
                        deleteStack(substack);
                    }
                    if (blocks[block_id].clamped_block2 != -1) {
                        let child = blocks[block_id].clamped_block2;
                        let substack = blocks[child].block_stack;
                        deleteStack(substack);
                    }

                    blocks[block_id].groupobject.destroy();
                    delete blocks[block_id];
                }
                stacks.splice(stack,1);
            }

            deleteStack(dragged_stack);

            if (stack_being_run == dragged_stack) {
                stack_being_run = -1
                run_main_stack();
                makeShader(DEFAULT_SHADER_CODE);
            }


            // delete blocks

            updateBlocks();
            updateShaderCode();
            return;
        }

        if (this.x() > window.innerWidth - GL_WINDOW_WIDTH - 20 ||
            this.y() < 0 ||
            this.y() > window.innerHeight) {
            let block = blocks[this.block_id];
            block.x = block.prev_x;
            block.y = block.prev_y;

        }

        blocks[this.block_id].dragged = false;

        var insert_stack = -1;
        var insert_block = -1;
        for (let s = 0; s < stacks.length; s++) {
            for (let b = 0; b < stacks[s].length; b++) {
                if (stacks[s][b][0] == hovered_block) {
                    insert_stack = s;
                    insert_block = b;
                }
            }
        }
        let block_inserted = stacks[dragged_stack][0][0];
        if (blocks[block_inserted].blocktype == 1) {
            // inserting arg blocks
            if (insert_block != -1) {

                // change the child parameter in the stack
                stacks[insert_stack][insert_block][2][hovered_arg] = stacks[dragged_stack][0][0];

                let first_part = stacks[insert_stack].slice(0, insert_block+1);
                let middle_part = stacks[dragged_stack];
                let last_part = stacks[insert_stack].slice(insert_block + 1);
                let new_stack = first_part.concat(middle_part).concat(last_part);
                stacks[insert_stack] = new_stack;
                stacks.splice(dragged_stack,1);
                updateBlocks();
                updateShaderCode();
            }
        } else {

            // contact insertion

            if (hovered_block != -1 && hovered_contact > 0) {

                // increase insert_block until no more children
                let all_children = stacks[insert_stack][insert_block][2].slice();
                all_children.push(insert_block)

                if (hovered_contact == 1 || hovered_contact == 2) {
                    if (hovered_contact == 2) {
                        while (!all_children.includes(stacks[insert_stack][insert_block]) && insert_block < stacks[insert_stack].length - 1) {
                            insert_block += 1;
                            all_children = all_children.concat(stacks[insert_stack][insert_block][2]);
                        }
                    } else {
                        insert_block = insert_block -1;
                    }

                    let first_part = stacks[insert_stack].slice(0, insert_block+1);
                    let middle_part = stacks[dragged_stack];
                    let last_part = stacks[insert_stack].slice(insert_block + 1);
                    let new_stack = first_part.concat(middle_part).concat(last_part);
                    stacks[insert_stack] = new_stack;
                    stacks.splice(dragged_stack, 1);
                } else {
                    if (hovered_contact == 3) {
                        let parent = stacks[insert_stack][insert_block][0];
                        let child = stacks[dragged_stack][0][0];
                        blocks[parent].clamped_block = child;
                        blocks[child].clamp_parent = parent;
                    } else if (hovered_contact == 4) {
                        let parent = stacks[insert_stack][insert_block][0];
                        let child = stacks[dragged_stack][0][0];
                        blocks[parent].clamped_block2 = child;
                        blocks[child].clamp_parent2 = parent;
                    }
                }
            }
        }
        dragged_stack = -1;

        updateBlocks();
        updateShaderCode();
    });

    blockgroup.on('dragstart', function () {

        let d_block = blocks[this.block_id];
        d_block.prev_x = d_block.x;
        d_block.prev_y = d_block.y;
        d_block.dragged = true;
        for (let s = 0; s < stacks.length; s++) {
            for (let b = 0; b < stacks[s].length; b++) {

                // get the parent and replace it with -1.

                let children = stacks[s][b][2];
                if (stacks[s][b][2].includes(this.block_id)) {
                    parent = stacks[s][b][0];
                    let index = children.indexOf(this.block_id);
                    children[index] = -1;
                }

                if (stacks[s][b][0] == this.block_id && b > 0) {

                    // we found the block to remove.

                    // iterate until finding a block that is not a child, to get length of substack.

                    let subchilds = [];

                    subchilds = subchilds.concat(stacks[s][b][2]);
                    let b2 = b;
                    b2++;
                    while (b2 < stacks[s].length && subchilds.includes(stacks[s][b2][0])) {
                        subchilds = subchilds.concat(stacks[s][b2][2]);
                        b2++;
                    }

                    // splice out the removed substack.

                    if (stack_being_run == s) {
                        stack_being_run = stacks.length - 1;
                    }

                    // replace instances of 
                    let oldstack = stacks[s].slice(0, b);
                    let newstack = stacks[s].slice(b, b2);
                    let endstack = [];
                    if (stacks[s].length > b2) {
                        endstack = stacks[s].slice(-(stacks[s].length-b2));
                    }

                    if (blocks[this.block_id].blocktype == 1) {
                        oldstack = oldstack.concat(endstack);
                    } else {
                        newstack = newstack.concat(endstack);
                    }
                    stacks.splice(s, 1);
                    stacks.push(oldstack);
                    stacks.push(newstack);
                    blocks[this.block_id].block_stack = stacks[s].length - 1;
                    //need to cleanup

                    //initializing new stack
                    for (let k = 0; k < stacks[stacks.length-1].length; k++) {
                        let underblock = blocks[stacks[stacks.length-1][k][0]];
                        let underblockobject = underblock.groupobject;
                        if (k == 0) {
                            this.x(underblock.x);
                            this.y(underblock.y);
                            this.offsetX(underblock.x);
                            this.offsetY(underblock.y);
                        }
                        underblockobject.block_stack = stacks.length - 1;
                    }

                    updateBlocks();
                    updateShaderCode();

                    return;
                }
            }
        }
    });

    blockgroup.on('click', function () {
        dragged_stack = -1;
        findMouseOveredBlock();
        if (hovered_arg == -1) {
            if (stack_being_run == this.block_stack) {
                stack_being_run = -1
                run_main_stack();
                updateBlocks();
                makeShader(DEFAULT_SHADER_CODE);
            } else {
                stack_being_run = this.block_stack;
                updateBlocks();
                updateShaderCode();
                for (i = 0; i < stacks[stack_being_run].length; i++) {
                    let block_to_run = blocks[stacks[stack_being_run][i][0]];
                    if (block_to_run.blocktype != 1) {
                        block_to_run.eval();
                    }
                }
            }
        } else {
            let block = blocks[hovered_block];

            let arg = -1;
            let hovered_text = 0
            for (let i = 0; i < block.skeleton.length; i++){
                if (block.skeleton[i] != 0) {
                    arg += 1;
                    if (arg == hovered_arg) {
                        hovered_text = i;
                    }
                }
            }

            let textObject = block.textobjects[hovered_text];
            textObject.writing();
        }
    });

    layer.add(blockgroup);
    blockgroup.zIndex(num_of_blocks+2);

}

function getBlock(id) {
    // let block_location = 0;
    // while (blocks[block_location].id != id && block_location < blocks.length) {
    //     block_location += 1;
    // }
    return blocks[id];
}

function updateBlocks () {
    //findMouseOveredBlock();
    for (let s = 0; s < stacks.length; s++){
        let prev = null;
        for (let b = 0; b < stacks[s].length; b++){
            let block_id = stacks[s][b][0];
            let updated_block = getBlock(block_id);

            // update 'next' values
            updated_block.next = null;
            if (updated_block.blocktype != 1) {
                if (prev != null) {
                    getBlock(prev).next = stacks[s][b][0];
                }
                prev = stacks[s][b][0];
            }
            // update stack values
            updated_block.groupobject.block_stack = s;
            updated_block.children = stacks[s][b][2];
            updated_block.block_stack = s;

            // update how it looks
            updated_block.updateSize();
            updated_block.updateLocation();
        }
    }

    for (let s = 0; s < stacks.length; s++){
        for (let b = 0; b < stacks[s].length; b++){
            blocks[stacks[s][b][0]].updateLocation();
        }
    }

    //print_stacks();
}

function findMouseOveredBlock () {

    hovered_block = -1;
    hovered_arg = -1;
    hovered_contact = -1

    for (let stack of stacks) {
        for (let stackitem of stack) {
            let block = blocks[stackitem[0]];
            if (!block.dragged) {
                var dragX = mouseX;
                var dragY = mouseY;
                var distX = dragX - block.x;
                var distY = dragY - block.y;
                if (distX > 0 && 
                    distX < block.width &&
                    distY > 0 &&
                    distY < block.height) {

                    let prosp_hovered_block = stackitem[0];
                    // found the block, now time to find the nearest argument.

                    let h_block_obj = blocks[prosp_hovered_block];
                    let textbox = 0;
                    for (let a = 0; a < h_block_obj.argboxobjects.length; a++) {
                        let argx = h_block_obj.argboxobjects[a].x();
                        if (argx < distX) {
                            textbox = a;
                        }
                    }

                    let skeleton = h_block_obj.skeleton;
                    let prosp_hovered_arg = -1
                    if (skeleton[textbox] != 0) {
                        prosp_hovered_arg = 0;
                        for (let i = 0; i < textbox; i++) {
                            if (skeleton[i] != 0) {
                                prosp_hovered_arg += 1;
                            }
                        }
                        if (stackitem[2][prosp_hovered_arg] == -1) {
                            hovered_arg = prosp_hovered_arg;
                            hovered_block = prosp_hovered_block;
                        }
                    }
                }
            }
        }
    }
}

document.onmousemove = handleMouseMove;
function handleMouseMove(event) {
    mouseX = event.pageX;
    mouseY = event.pageY;
}

function findHoveredBlock () {

    hovered_block = -1;
    hovered_arg = -1;
    hovered_contact = -1;

    for (let stack of stacks) {
        for (let stackitem of stack) {
            let block = blocks[stackitem[0]];
            if (!block.dragged) {

                var dragged_block = blocks[stacks[dragged_stack][0][0]];

                // first find oval arguments

                var dragX = dragged_block.groupobject.x();
                var dragY = dragged_block.groupobject.y();
                var distX = dragX - block.x;
                var distY = dragY - block.y;
                if (distX > 0 && 
                    distX < block.width &&
                    distY > 0 &&
                    distY < block.height_with_clamp) {

                    let prosp_hovered_block = stackitem[0];
                    // found the block, now time to find the nearest argument.

                    let h_block_obj = blocks[prosp_hovered_block];
                    let textbox = 0;
                    for (let a = 0; a < h_block_obj.argboxobjects.length; a++) {
                        let argx = h_block_obj.argboxobjects[a].x();
                        if (argx < distX) {
                            textbox = a;
                        }
                    }

                    let skeleton = h_block_obj.skeleton;
                    let prosp_hovered_arg = -1
                    if (skeleton[textbox] != 0) {
                        prosp_hovered_arg = 0;
                        for (let i = 0; i < textbox; i++) {
                            if (skeleton[i] != 0) {
                                prosp_hovered_arg += 1;
                            }
                        }
                        if (stackitem[2][prosp_hovered_arg] == -1) {
                            hovered_arg = prosp_hovered_arg;
                            hovered_block = prosp_hovered_block;
                        }
                    }
                }

                // then find bottom & top connection points

                if (blocks[stacks[dragged_stack][0][0]].blocktype != 1) { 

                    if (distX > 0 && distX < CONTACT_WIDTH * SCALE) {

                        if (!blocks[stacks[dragged_stack][0][0]].cap) {
                            // bottom contact
                            if (distY > block.height_with_clamp &&
                                distY < block.height_with_clamp+CONTACT_HEIGHT * SCALE) {

                                hovered_block = stackitem[0];
                                hovered_contact = 2;
                            }
                        }
                        if (!block.cap) {
                            if (distY > -dragged_block.height_with_clamp - CONTACT_HEIGHT * SCALE &&
                                distY < -dragged_block.height_with_clamp) {

                                hovered_block = stackitem[0];
                                hovered_contact = 1;
                            }
                        }
                    }
                    if (block.blocktype == 2 || block.blocktype == 3) { 
                        if (distX > CLAMP_WIDTH * SCALE && distX < (CONTACT_WIDTH + CLAMP_WIDTH) * SCALE) { 
    
                            if (distY > block.height &&
                                distY < block.height+CONTACT_HEIGHT * SCALE) {
    
                                hovered_block = stackitem[0];
                                hovered_contact = 3;
                            }

                            if (block.blocktype == 3) { 
                                if (distY > block.height_with_first_clamp &&
                                    distY < block.height_with_first_clamp+CONTACT_HEIGHT * SCALE) {
        
                                    hovered_block = stackitem[0];
                                    hovered_contact = 4;
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

function print_stacks () {
    console.log(stacks);
    let string = "";
    for (let s = 0; s < stacks.length; s ++) {
        for (let b = 0; b < stacks[s].length; b ++) {
            string = string.concat(stacks[s][b][0]);
            string += " ";
            string = string.concat(stacks[s][b][1]);
            string += " ";
            string = string.concat(blocks[stacks[s][b][0]].clamped_block);
            string += " ";
            string = string.concat(blocks[stacks[s][b][0]].clamp_parent);
            string += " ";
            string = string.concat(blocks[stacks[s][b][0]].clamped_block2);
            string += " ";
            string = string.concat(blocks[stacks[s][b][0]].clamp_parent2);
            string += "\n";
        }
        string += "\n";
    }
    console.log(string);
}


function updateShaderCodeAux (block_id) {
    if (block_id == -1) {
        return "";
    }
    let code = "";
    
    let block = blocks[block_id];
    
    let num_of_args = block.shadercode_template.length;
    for (let i = 0; i < num_of_args; i++) {
        code = code.concat(block.shadercode_template[i]);
        if (i < num_of_args - 1) {
            let child = block.children[i]
            if (child != null && child != -1) {
                code = code.concat(updateShaderCodeAux(block.children[i]));
            } else {
                let text = block.textArgs[i];
                switch (text) {
                    case "red":
                        text = "vec4(1,0,0,0)"; break;
                    case "yellow":
                        text = "vec4(1,1,0,0)"; break;
                    case "lime":
                        text = "vec4(0,1,0,0)"; break;
                    case "cyan":
                        text = "vec4(0,1,1,0)"; break;
                    case "blue":
                        text = "vec4(0,0,1,0)"; break;
                    case "magenta":
                        text = "vec4(1,0,1,0)"; break;
                    case "white":
                        text = "vec4(1,1,1,0)"; break;
                    case "black":
                        text = "vec4(0,0,0,0)"; break;
                    case "":
                    case undefined:
                    case " ":
                        text = "0.0"; break;
                    default:
                        if (text[0] == "#") {
                            text = "vec4(" + HEXToVBColor(text.substr(1)) + ", 0)"; break;
                        }
                }
                code = code.concat(text);
            }
        }
    }
    if (block.blocktype == 2 || block.blocktype == 3) {
        code = code.concat("\n{\n");
        code = code.concat(updateShaderCodeAux(block.clamped_block));
        code = code.concat("\n}\n");
    }

    if (block.blocktype == 3) {
        code = code.concat("\nelse\n")
        code = code.concat("\n{\n");
        code = code.concat(updateShaderCodeAux(block.clamped_block2));
        code = code.concat("\n}\n");
    }

    if (block.next != null) {
        code = code.concat(updateShaderCodeAux(block.next));
    }

    return code;
}

function updateShaderCode () {

    shader_code = "";

    let s = stack_being_run;
    if (stack_being_run > -1) {
        let block_id = stacks[s][0][0];
        shader_code = updateShaderCodeAux(block_id);
        // for (let b = 0; b < stacks[s].length; b++) {
        //     let block_id = stacks[s][b][0];
        //     if (blocks[block_id].blocktype != 1) {
        //         shader_code = shader_code.concat(updateShaderCodeAux(block_id));
        //     }
        // }

        console.log(shader_code);
        makeShader(shader_code);
    } else {
        makeShader(DEFAULT_SHADER_CODE);
    }
}

for (let s = 0; s < stacks.length; s++) { 
    for (let b = 0; b < stacks[s].length; b++) {
        let stackitem = stacks[s][b];
        let x = stackitem[4] == null ? 0 : stackitem[4][0];
        let y = stackitem[4] == null ? 0 : stackitem[4][1];
        let library_block = stackitem[5] != null;
        fullyCreateBlock(stackitem[1], stackitem[0], stackitem[3], x, y, library_block);
    }
}

for (let s = 0; s < stacks.length; s++) { 

    // Get 'next' value for block
    // easy
    for (let b = 0; b < stacks[s].length; b++) {
        let block = blocks[stacks[s][b][0]];
        block.children = stacks[s][b][2];
        if (b < stacks[s].length - 1) {
            let next = stacks[s][b+1][0];
            if (!block.children.includes(next)) {
                block.next = stacks[s][b+1][0];
            }
        }
    }

    for (let b = 0; b < stacks[s].length; b++) {
        let block = blocks[stacks[s][b][0]];
        block.updateSize();
    }

    for (let b = 0; b < stacks[s].length; b++) {
        //calculate location of each block
        let block = blocks[stacks[s][b][0]];
        block.updateLocation();
    }
}

stage.add(layer);

run_main_stack();
updateBlocks();





// CANVAS STUFF
const canvas = document.querySelector("#glcanvas");
// Initialize the GL context
const gl = canvas.getContext("webgl2");

// Only continue if WebGL is available and working
if (gl === null) {
alert(
    "Unable to initialize WebGL. Your browser or machine may not support it."
);
// return;
}

// Set clear color to black, fully opaque
gl.clearColor(0.2, 1.0, 0.2, 1.0);
// Clear the color buffer with specified clear color
gl.clear(gl.COLOR_BUFFER_BIT);


const vertexCode = `
#version 300 es

in vec4 vertexPosition;

void main() {
gl_Position = vertexPosition;
}
`;

const fragmentCode = `
#version 300 es
precision highp float;

uniform float frame;
uniform float sinframe;
uniform vec2 mouse;
uniform vec2 canvasSize;
out vec4 fragColor;

void main() {
vec2 coord = gl_FragCoord.xy/canvasSize.xy;
fragColor = vec4(coord.x, coord.y, sin(float(frame) / float(10)), 1);
}
`;

const fragmentCodeBeginning = `
#version 300 es
precision highp float;

uniform float frame;
uniform float sinframe;
uniform vec2 mouse;
uniform vec2 canvasSize;
out vec4 fragColor;

int _add(int x, int y) {return x + y;}
float _add(float x, float y) {return x + y;}
float _add(int x, float y) {return float(x) + y;}
float _add(float x, int y) {return x + float(y);}

int _subtract(int x, int y) {return x - y;}
float _subtract(float x, float y) {return x - y;}
float _subtract(int x, float y) {return float(x) - y;}
float _subtract(float x, int y) {return x - float(y);}

int _multiply(int x, int y) {return x * y;}
float _multiply(float x, float y) {return x * y;}
float _multiply(int x, float y) {return float(x) * y;}
float _multiply(float x, int y) {return x * float(y);}

float _divide(int x, int y) {return float(x) / float(y);}
float _divide(float x, float y) {return x / y;}
float _divide(int x, float y) {return float(x) / y;}
float _divide(float x, int y) {return x / float(y);}

int _mod(int x, int y) {return x % y;}
float _mod(float x, float y) {return float( int(x * 1000.) % int(y * 1000.)) / 1000.;}

float _sin(int x) {return sin(float(x));}
float _sin(float x) {return sin(x);}

float _cos(int x) {return cos(float(x));}
float _cos(float x) {return cos(x);}

float _tan(int x) {return tan(float(x));}
float _tan(float x) {return tan(x);}

bool _bool(bool x) {return x;}

void main() {
float r = 0.;
float g = 0.;
float b = 0.;
float a = 1.;
vec2 coord = gl_FragCoord.xy/canvasSize.xy;
`;

const fragmentCodeEnd = `
fragColor = vec4(r, g, b, a);
}
`;

// fragColor = vec4(coord.x, coord.y, (sinframe / 2.) + 0.5, 1);

function createShader(shaderType, sourceCode) {
const shader = gl.createShader(shaderType);
gl.shaderSource(shader, sourceCode.trim());
gl.compileShader(shader);
if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw gl.getShaderInfoLog(shader);
}
return shader;
}


let program = gl.createProgram();

const vertices = [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
];

function makeShader (code) {
    program = gl.createProgram();

    gl.attachShader(program, createShader(gl.VERTEX_SHADER, vertexCode));
    gl.attachShader(program, createShader(gl.FRAGMENT_SHADER, fragmentCodeBeginning + code + fragmentCodeEnd));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw gl.getProgramInfoLog(program);
    }
    gl.useProgram(program);

    const vertexData = new Float32Array(vertices.flat());
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW);

    const vertexPosition = gl.getAttribLocation(program, "vertexPosition");
    gl.enableVertexAttribArray(vertexPosition);
    gl.vertexAttribPointer(vertexPosition, 2, gl.FLOAT, false, 0, 0);

    const canvasSizeUniform = gl.getUniformLocation(program, 'canvasSize');
    gl.uniform2f(canvasSizeUniform, canvas.width, canvas.height);

}

makeShader(shader_code);

let frame = 0;

let everyFrame = function() {
    frame += 1;

    const frameUniform = gl.getUniformLocation(program, 'frame');
    gl.uniform1f(frameUniform, frame / 60);

    const sinFrameUniform = gl.getUniformLocation(program, 'sinframe');
    gl.uniform1f(sinFrameUniform, Math.sin(frame/50));

    const mouseUniform = gl.getUniformLocation(program, 'mouse');
    gl.uniform2f(mouseUniform, (mouseX - window.innerWidth + GL_WINDOW_WIDTH) / GL_WINDOW_WIDTH, mouseY / GL_WINDOW_WIDTH);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertices.length);
}

var t = setInterval(everyFrame, 30);
