
// var c = document.getElementById("canvas");
// var ctx = c.getContext("2d");

// let colors = {black: "#000000", red: "#b40022", brown: "#c9921b", orange: "#eba800", yellow: "#facd02", lime: "#cbe000", darkgreen: "#028b53", blue: "#0fb5c5", grey: "#9dc9d4", lightblue: "#cbe8f9", lavender: "#d6cade", skin: "#ffd3c7", white: "#ffffff"};

// let colors = ["#b40022", "#c9921b", "#eba800", "#facd02",  "#cbe000", "#028b53",  "#0fb5c5", "#9dc9d4",  "#cbe8f9", "#d6cade", "#ffd3c7"];

const colors = ['#DA0000', '#CB5E00', '#998300', '#008430', '#006DCB', '#84004F', '#CB008B'];
const highlight_colors = ["#A2003C", "#A02E00", "#576400", "#006273", "#1637A8", "#250033", "#860099"];

const OPERATION_COLOR = 3;
const FLOW_COLOR = 2;
const BLOCK_HEIGHT = 30;
const ROUNDEDNESS = 15;

let hovered_block = -1;
let hovered_arg = -1;

let dragged_stack = -1;

let stack_being_run = -1;

const SCALE = .75;

const DEFAULT_SHADER_CODE = `fragColor = vec4(0.1, 0.1, 0.4, 1.0);`;

let shader_code = DEFAULT_SHADER_CODE;

let mouseX = 0;
let mouseY = 0;

class Block {

    updateSize () {

        let width = 0;
        let height = BLOCK_HEIGHT * SCALE;
        height += marginy * 2 * SCALE;

        let arg_num = 0;
        for (let textpart = 0; textpart < this.skeleton.length; textpart++) {
            if (this.skeleton[textpart] == 1) {
                this.text[textpart] = this.textArgs[arg_num];
                arg_num += 1;
            }
            this.textobjects[textpart].text(this.text[textpart]);
        }

        // color block when running code
        if (this.block_stack == stack_being_run) {
            this.rectobject.stroke('yellow');
        } else {
            this.rectobject.stroke(highlight_colors[this.color]);
        }

        // hover highlight
        let argnum = 0;
        for (let i = 0; i < this.skeleton.length; i++) {
            if (hovered_block == this.id) {
                if (argnum == hovered_arg) {
                    this.argboxobjects[i].stroke('cyan');
                } else {
                    this.argboxobjects[i].stroke(highlight_colors[this.color]);
                }
            } else {
                this.argboxobjects[i].stroke(highlight_colors[this.color]);
            }
            if (this.skeleton[i] == 1) {argnum += 1;}
        }

        let max_child_height = 0;
        let child_num = 0;
        for (let c = 0; c < this.skeleton.length; c++) {
            if (this.skeleton[c] == 1) {
                let child = this.children[child_num];
                if (child != null && child != -1) {
                    blocks[child].updateSize();
                    this.textwidths[c] = blocks[child].width - 2 * marginx * SCALE;
                    width += blocks[child].width;
                    if (blocks[child].height > max_child_height) {
                        max_child_height = blocks[child].height;
                        height = max_child_height + 2 * marginy * SCALE;
                    }
                } else {
                    let default_text_length = this.textobjects[c].width();
                    this.textwidths[c] = default_text_length;
                    width += this.textwidths[c];
                    width += 2 * marginx * SCALE;
                }
                child_num += 1;
            } else {
                width += this.textwidths[c];
                width += 2 * marginx * SCALE;
            }
        }

        width += 2 * marginx * SCALE;
        this.width = width;
        this.height = height;
        this.rectobject.width(this.width);
        this.rectobject.height(this.height);

        for (let a = 0; a < this.argboxobjects.length; a++) {
            argbox = this.argboxobjects[a];
            argbox.width(this.textwidths[a] + 2 * marginx * SCALE);
            argbox.height(BLOCK_HEIGHT * SCALE);
        }
    }

    updateLocation() {

        if (this.next != null) {
            if (blocks[this.next].blocktype == 0) {
                blocks[this.next].y = this.y + this.height;
                blocks[this.next].x = this.x;
            }
        }

        let childx = marginx;
        let child_num = 0;
        for (let c = 0; c < this.skeleton.length; c++) {
            if (this.skeleton[c] == 1) {
                let child = this.children[child_num];
                if (child != null && child != -1) {
                    blocks[child].y = this.y + (this.height / 2) - (blocks[child].height / 2);
                    blocks[child].x = this.x + childx;
                }
                child_num += 1;
            }
            childx += this.textwidths[c] + 2 * marginx * SCALE;
        }

        let argx = marginx;
        for (let a = 0; a < this.argboxobjects.length; a++) {
            let argbox = this.argboxobjects[a];
            argbox.x(argx);
            argbox.y((this.height - BLOCK_HEIGHT * SCALE) / 2);
            argx += this.textwidths[a] + 2 * marginx * SCALE;
        }

        let textx = 2 * marginx * SCALE;
        for (let a = 0; a < this.textobjects.length; a++) {
            let text = this.textobjects[a];
            text.x(textx);
            text.y(this.height / 2 - 10 * SCALE);
            textx += this.textwidths[a] + 2 * marginx * SCALE;
        }

        this.groupobject.x(this.x);
        this.groupobject.y(this.y);

    }

    prepArgs() {
        this.args = [];
        let child_num = 0;
        for (let i = 0; i < this.skeleton.length; i++) {
            if (this.skeleton[i] == 1) {
                if (this.children[child_num] == null || this.children[child_num] == -1) {
                    this.args.push(this.text[i]);
                } else {
                    this.args.push(blocks[this.children[child_num]].eval());
                }
                child_num += 1;
            }
        }
    }

    name = "block";

    color = 1;

    blocktype = 0;

    shadercode_template = [];

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
        this.next = null;
        this.dragged = false;
        this.groupobject = null;
        this.children = null;
        this.block_stack = 0;
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

class ClampBlock extends StackBlock {}
class DoubleClampBlock extends StackBlock {}
class PrintBlock extends StackBlock {
    name = "print";
    color = 6;
    skeleton = [0, 1];
    text = ["print", "Hello!"];
    shadercode_template = ["//", "\n"];

    eval () {
        this.prepArgs();
        console.log(this.args[0]);
        return null;
    }
}
class ColorBlock extends StackBlock {
    name = "color";
    color = 5;
    skeleton = [0,1,0,1,0,1,0,1];
    text = ["red", "0", "green", "0", "blue", "0", "transparent", "1"];
    shadercode_template = ["fragColor = vec4(", ", ", ", ", ", ", ");\n"];
}

class XBlock extends ArgBlock {
    name = "x";
    color = 4;
    skeleton = [0];
    text = ["X"];
    shadercode_template = ["coord.x"];
}
class YBlock extends ArgBlock {
    name = "y";
    color = 4;
    skeleton = [0];
    text = ["Y"];
    shadercode_template = ["coord.y"];
}
class TimerBlock extends ArgBlock {
    name = "timer";
    color = 4;
    skeleton = [0];
    text = ["timer"];
    shadercode_template = ["frame"];
}

class RedBlock extends StackBlock {
    name = "red";
    color = 0;
    skeleton = [0];
    text = ["red"];
    shadercode_template = ["red"];
}

class OrangeBlock extends StackBlock {
    name = "orange";
    color = 1;
    skeleton = [0];
    text = ["orange"];
    shadercode_template = ["orange"];
}

class YellowBlock extends StackBlock {
    name = "yellow";
    color = 2;
    skeleton = [0];
    text = ["yellow"];
    shadercode_template = ["yellow"];
}

class GreenBlock extends StackBlock {
    name = "green";
    color = 3;
    skeleton = [0];
    text = ["green"];
    shadercode_template = ["green"];
}

class BlueBlock extends StackBlock {
    name = "blue";
    color = 4;
    skeleton = [0, 1, 0, 1, 0, 1];
    text = ["blue", "is", "the", "best", "color", "ever"];
    shadercode_template = ["blue"];
}

class PurpleBlock extends StackBlock {
    name = "purple";
    color = 5;
    skeleton = [0];
    text = ["purple"];
    shadercode_template = ["purple"];
}

class PinkBlock extends StackBlock {
    name = "pink";
    color = 6;
    skeleton = [0];
    text = ["pink"];
    shadercode_template = ["pink"];
}

class AddBlock extends ArgBlock {
    name = "add";
    color = OPERATION_COLOR
    skeleton = [1, 0, 1];
    text = [" ", "+", " "];
    shadercode_template = ["(", " + ", ")"];

    eval () {
        this.prepArgs();
        return parseFloat(this.args[0]) + parseFloat(this.args[1]);
    }
}

class SubtractBlock extends ArgBlock {
    name = "subtract";
    color = OPERATION_COLOR
    skeleton = [1, 0, 1];
    text = [" ", "-", " "];
    shadercode_template = ["(", " - ", ")"];

    eval () {
        this.prepArgs();
        return parseFloat(this.args[0]) - parseFloat(this.args[1]);
    }
}

class MultiplyBlock extends ArgBlock {
    name = "multiply";
    color = OPERATION_COLOR
    skeleton = [1, 0, 1];
    text = [" ", "*", " "];
    shadercode_template = ["(", " * ", ")"];

    eval () {
        this.prepArgs();
        return parseFloat(this.args[0]) * parseFloat(this.args[1]);
    }
}
class DivideBlock extends ArgBlock {
    name = "divide";
    color = OPERATION_COLOR
    skeleton = [1, 0, 1];
    text = ["1", "/", "1"];

    shadercode_template = ["(float(", ") / float(", "))"];

    eval () {
        this.prepArgs();
        return parseFloat(this.args[0]) / parseFloat(this.args[1]);
    }
}
class SineBlock extends ArgBlock {
    name = "sine";
    color = OPERATION_COLOR
    skeleton = [0, 1];
    text = ["sine", "90"];
    shadercode_template = ["sin", ""];

    eval () {
        this.prepArgs();
        return Math.sin(parseFloat(this.args[0]));
    }
}
class CosineBlock extends ArgBlock {
    name = "cosine";
    color = OPERATION_COLOR
    skeleton = [0, 1];
    text = ["cosine", "90"];
    shadercode_template = ["cosine", ""];

    eval () {
        this.prepArgs();
        return Math.cos(parseFloat(this.args[0]));
    }
}
class TangentBlock extends ArgBlock {
    name = "tangent";
    color = OPERATION_COLOR
    skeleton = [0, 1];
    text = ["tangent", "90"];
    shadercode_template = ["tangent", ""];

    eval () {
        this.prepArgs();
        return Math.tan(parseFloat(this.args[0]));
    }
}
class AndBlock extends BoolArgBlock {
    name = "and";
    color = OPERATION_COLOR
    skeleton = [1, 0, 1];
    text = ["false", "and", "false"];
    shadercode_template = ["(", " && ", ")"];

    eval () {
        this.prepArgs();
        return this.args[0] && this.args[1];
    }
}
class OrBlock extends BoolArgBlock {
    name = "or";
    color = OPERATION_COLOR
    skeleton = [1, 0, 1];
    text = ["false", "or", "false"];
    shadercode_template = ["(", " || ", ")"];

    eval () {
        this.prepArgs();
        return this.args[0] || this.args[1];
    }
}
class NotBlock extends BoolArgBlock {
    name = "not";
    color = OPERATION_COLOR
    skeleton = [0, 1];
    text = ["not", "false"];
    shadercode_template = ["(!", ")"];

    eval () {
        this.prepArgs();
        return !this.args[0];
    }
}
class IfBlock extends ClampBlock {
    name = "if";
    color = FLOW_COLOR;
    skeleton = [0, 1, 0, 1];
    text = ["if", "false", "then"];
    shadercode_template = ["if (", ") {", "}"];

    eval () {
        this.prepArgs();
        if (this.args[0]) {this.next.eval()}; 
        return null;
    }
}

var width = window.innerWidth - 260;
var height = window.innerHeight;

var stage = new Konva.Stage({
  container: 'container',
  width: width,
  height: height,
});

var layer = new Konva.Layer();

background = new Konva.Rect({
    fill: "#222233",
    width: width,
    height: height
})
layer.add(background);

var marginx = 8;
var marginy = 4;
var strokeweight = 2;

var stackobjects = [];

var blocks = []

var stacks = [
    [[0, "print", [1], ["Hello"], [10, 10]],
    [1, "add", [2, 3], ["", ""]],
    [2, "multiply", [-1, -1], [50, 40]],
    [3, "subtract", [-1, -1], [30, 20]],
    ],

    [[4, "print", [-1], ["Hello!"], [100, 50]],
    [5, "print", [-1], ["How are you?"]],
    [6, "print", [-1], ["I am well"]]
    ],

    [[7, "red", [], [], [200, 40]],
    [8, "orange", [], []],
    [9, "yellow", [], []],
    [10, "green", [], []],
    [11, "blue", [-1, -1, -1], ["is", "best", "ever"]],
    [12, "purple", [], []],
    [13, "pink", [], []]
    ],

    [[14, "color", [15, 16, 17, -1], ["0", "0", "0", "1"], [50, 300]],
    [15, "x", [], []],
    [16, "y", [], []],
    [17, "sine", [18], [90]],
    [18, "divide", [19, -1], ["0", "10"]],
    [19, "timer", [], []]
    ]
]

const BLOCK_LIBRARY = ["print", "color", "add", "subtract", "multiply", "divide", "sine", "cosine", "tangent", "and", "or", "not", "x", "y", "timer"];

let i = 20;
for (let blockname of BLOCK_LIBRARY) {
    stacks.push([[i, blockname, [], []]]);
    i += 1;
}

let y = 0;
for (let stack of stacks) {
    for (let stackitem of stack) {
        let blockname = stackitem[1];
        let textArgs = stackitem[3];
        spawnBlock(blockname, textArgs, 50 + .2 * y, y);
        y += 16;
    }
}

function spawnBlock (blockname, textArgs, x, y) {
    let b;
    switch (blockname) {
        case "print": b = new PrintBlock(); break;
        case "color": b = new ColorBlock(); break;
        case "x": b = new XBlock(); break;
        case "y": b = new YBlock(); break;
        case "timer": b = new TimerBlock(); break;
        case "red": b = new RedBlock(); break;
        case "orange": b = new OrangeBlock(); break;
        case "yellow": b = new YellowBlock(); break;
        case "green": b = new GreenBlock(); break;
        case "blue": b = new BlueBlock(); break;
        case "purple": b = new PurpleBlock(); break;
        case "pink": b = new PinkBlock(); break;
        case "add": b = new AddBlock(); break;
        case "subtract": b = new SubtractBlock(); break;
        case "multiply": b = new MultiplyBlock(); break;
        case "divide": b = new DivideBlock(); break;
        case "sine": b = new SineBlock(); break;
        case "cosine": b = new CosineBlock(); break;
        case "tangent": b = new TangentBlock(); break;
        case "and": b = new AndBlock(); break;
        case "or": b = new OrBlock(); break;
        case "not": b = new NotBlock(); break;
        case "if": b = new IfBlock(); break;

        default: b = new Block();
    }

    b.id = blocks.length;
    if (textArgs != null) {
        b.textArgs = textArgs;
    };
    b.x = x;
    b.y = y;
    blocks.push(b);
}

function updateBlocks () {
    for (let s = 0; s < stacks.length; s++){
        let prev = null;
        for (let b = 0; b < stacks[s].length; b++){
            let updated_block = blocks[stacks[s][b][0]];

            // update 'next' values
            updated_block.next = null;
            if (updated_block.blocktype == 0) {
                if (prev != null) {
                    blocks[prev].next = stacks[s][b][0];
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
}

function findHoveredBlock () {

    hovered_block = -1;
    hovered_arg = -1;

    for (stack of stacks) {
        for (stackitem of stack) {
            let block = blocks[stackitem[0]];
            if (!block.dragged) {
                var dragged_block = blocks[stacks[dragged_stack][0][0]];
                var dragX = dragged_block.groupobject.x();
                var dragY = dragged_block.groupobject.y();
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
                    argbox_x = 0;
                    for (let a = 0; a < h_block_obj.argboxobjects.length; a++) {
                        let argx = h_block_obj.argboxobjects[a].x();
                        //console.log(argx);
                        if (argx < distX) {
                            textbox = a;
                        }
                    }

                    let skeleton = h_block_obj.skeleton;
                    if (skeleton[textbox] == 1) {
                        hovered_arg = 0;
                        for (let i = 0; i < textbox; i++) {
                            if (skeleton[i] == 1) {
                                hovered_arg += 1;
                            }
                        }
                        hovered_block = prosp_hovered_block;
                        console.log("block", hovered_block, "arg", hovered_arg);
                    } else {
                        //hovered_arg = -1;
                    }

                }
            }
        }
    }
}

function updateShaderCodeAux (block_id) {
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
                code = code.concat(block.textArgs[i]);
            }
        }
    }
    return code;
}

function updateShaderCode () {

    shader_code = "";

    let s = stack_being_run;
    for (let b = 0; b < stacks[s].length; b++) {
        let block_id = stacks[s][b][0];
        if (blocks[block_id].blocktype == 0) {
            shader_code = shader_code.concat(updateShaderCodeAux(block_id));
        }
    }
}

for (var s = 0; s < stacks.length; s++) { 

    stackheight = 0;
    blockheights = [];


    // Get 'next' value for block
    // easy
    for (var b = 0; b < stacks[s].length; b++) {
        var block = blocks[stacks[s][b][0]];
        block.children = stacks[s][b][2];
        if (b < stacks[s].length - 1) {
            next = stacks[s][b+1][0];
            if (!block.children.includes(next)) {
                block.next = stacks[s][b+1][0];
            }
        }
    }

    // Iterate to calculate size

    // create konva objects for block --

    for (var b = 0; b < stacks[s].length; b++) {
        var block = blocks[stacks[s][b][0]];

        let textwidths = [];
        let textobjects = [];
        let argboxobjects = [];
        for (t = 0; t < block.text.length; t++) {
            textfill = (block.skeleton[t] == 1) ? 'black' : 'white';
            var text = new Konva.Text({
                text: block.text[t],
                fontSize: 20 * SCALE,
                fontFamily: 'Helvetica',
                fontStyle: 'bold',
                fill: textfill,
            })
            textwidths.push(text.width());
            textobjects.push(text);

            let argfill = colors[block.color];
            let argweight = 0;
            let opacity = 0;
            if (block.skeleton[t] == 1) {
                argfill = 'white';
                argweight = strokeweight;
                opacity = 1;
            }
            var argbox = new Konva.Rect({
                width: block.textwidths[t],
                height: BLOCK_HEIGHT * SCALE,
                fill: argfill,
                stroke: highlight_colors[block.color],
                strokeWidth: argweight,
                opacity: opacity,
                cornerRadius: ROUNDEDNESS * SCALE,
            });
            argboxobjects.push(argbox);

        }

        block.textwidths = textwidths;
        block.textobjects = textobjects;
        block.argboxobjects = argboxobjects;

        let r = ROUNDEDNESS * SCALE;
        let cornerRadius = (block.blocktype == 0) ? [0,r,r,0] : r;
        var rect = new Konva.Rect({
            fill: colors[block.color],
            stroke: highlight_colors[block.color],
            strokeWidth: strokeweight,
            cornerRadius: cornerRadius,
        });
        block.rectobject = rect;
        // can (and should ) be optimized
        var blockgroup = new Konva.Group({draggable: true});
        block.groupobject = blockgroup;
    }

    for (var b = 0; b < stacks[s].length; b++) {
        var block = blocks[stacks[s][b][0]];
        block.updateSize();
    }

    for (var b = 0; b < stacks[s].length; b++) {
        //calculate location of each block
        var block = blocks[stacks[s][b][0]];
        block.updateLocation();
    }

    for (var b = 0; b < stacks[s].length; b++) {

        var block = blocks[stacks[s][b][0]];

        stackheight += block.height;
        blockheights.push(block.height);

        var blockgroup = block.groupobject;

        blockgroup.add(block.rectobject);
        for (const argbox of block.argboxobjects){
            argbox.blockobject = block;
            blockgroup.add(argbox);
        }
        for (const text of block.textobjects){
            text.blockobject = block;
            blockgroup.add(text);
        }

        blockgroup.on('mouseover', function () {
            document.body.style.cursor = 'pointer';
            // if (!blocks[this.block_id].dragged) {
            //     hovered_block = this.block_id;
            //     console.log("newhover" + this.block_id);
            // }
            //console.log(hovered_block);
            //console.log("hover");
            //this.children[0].fill('white');
        });

        // for (let i = 0; i < block.argboxobjects.length; i++) {
        //     block.argboxobjects[i].on('mouseover', function () {
        //         // if (this.blockobject.skeleton[i] == 0) {
        //             console.log(i);
        //             console.log("argbox");
        //             hovered_arg = i;
        //         // }
        //     });
        // }

        blockgroup.on('mouseout', function () {
            //hovered_block = this.block_id;
            document.body.style.cursor = 'default';
            //this.children[0].fill(colors[blocks[this.block_id].color]);
        });

        blockgroup.block_stack = s;
        let block_id = stacks[s][b][0];
        blockgroup.block_id = block_id;
        //blocks[block_id].groupobject = blockgroup;

        blockgroup.on('dragmove', function () {

            blocks[this.block_id].dragged = true;
            dragged_stack = this.block_stack;

            //updateNeighborBlockPositions();

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
                block2.groupobject.zIndex(blocks.length - stacklength + b2 + 1);
            }

            findHoveredBlock();
            for (block of blocks) {
                block.updateSize();
                //block.groupobject.zIndex(1);
            }
        });

        blockgroup.on('dragend', function () {
            // iterate to find location of block in stack?
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
            if (insert_block != -1) {
                console.log("got here");
                console.log(hovered_block);
                console.log(insert_stack);
                console.log(insert_block);

                // for zeroth arg
                console.log(stacks[insert_stack][insert_block][2]);
                stacks[insert_stack][insert_block][2][0] = stacks[dragged_stack][0][0];
                let first_part = stacks[insert_stack].slice(insert_block, 1);
                let middle_part = stacks[dragged_stack];
                let last_part = stacks[insert_stack].slice(insert_block + 1);
                console.log(first_part);
                console.log(middle_part);
                console.log(last_part);
                new_stack = first_part.concat(middle_part).concat(last_part);
                stacks[insert_stack] = new_stack;
                stacks.splice(dragged_stack,1);
                console.log(stacks);
                updateBlocks();
            }


        });

        blockgroup.on('dragstart', function () {
            var parent = null;
            blocks[this.block_id].dragged = true;
            for (let s = 0; s < stacks.length; s++) {
                for (let b = 0; b < stacks[s].length; b++) {

                    // get the parent and replace it with -1.

                    let children = stacks[s][b][2];
                    if (stacks[s][b][2].includes(this.block_id)) {
                        parent = stacks[s][b][0];
                        index = children.indexOf(this.block_id);
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

                        return;
                    }
                }
            }
        });

        blockgroup.on('click', function () {
            if (stack_being_run == this.block_stack) {
                stack_being_run = -1
                updateBlocks();
                makeShader(DEFAULT_SHADER_CODE);
            } else {
                stack_being_run = this.block_stack;
                updateBlocks();
                updateShaderCode();
                console.log(shader_code);
                makeShader(shader_code);
                for (i = 0; i < stacks[stack_being_run].length; i++) {
                    let block_to_run = blocks[stacks[stack_being_run][i][0]];
                    if (block_to_run.blocktype == 0) {
                        block_to_run.eval();
                    }
                }
            }
        });

        layer.add(blockgroup);
        blockgroup.zIndex(b+1);
    }

    // var stackgroup = new Konva.Group();

    // var stackrect = new Konva.Rect({
    //     x: 0,
    //     y: 0,
    //     fill: "white",
    //     opacity: 0.5,
    //     width: 50,
    //     height: 50,
    // });

    // stackgroup.add(stackrect);

    // layer.add(stackgroup);
    // stackobjects.push(stackgroup);
    stage.add(layer);

}

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

uniform int frame;
uniform float sinframe;
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

uniform int frame;
uniform float sinframe;
uniform vec2 canvasSize;
out vec4 fragColor;

void main() {
vec2 coord = gl_FragCoord.xy/canvasSize.xy;
`;

const fragmentCodeEnd = `
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

everyFrame = function() {
    frame += 1;

    const frameUniform = gl.getUniformLocation(program, 'frame');
    gl.uniform1i(frameUniform, frame);

    const sinFrameUniform = gl.getUniformLocation(program, 'sinframe');
    gl.uniform1f(sinFrameUniform, Math.sin(frame/50));

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertices.length);
}

var t = setInterval(everyFrame, 30);
