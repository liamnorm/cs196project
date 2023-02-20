
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

let hovered_block = 0;

class Block {

    updateSize () {

        let width = 0;
        let height = BLOCK_HEIGHT;
        height += marginy * 2;

        let max_child_height = 0;
        let child_num = 0;
        for (let c = 0; c < this.skeleton.length; c++) {
            if (this.skeleton[c] == 1) {
                let child = this.children[child_num];
                if (child != null && child != -1) {
                    blocks[child].updateSize();
                    this.textwidths[c] = blocks[child].width - 2 * marginx;
                    width += blocks[child].width;
                    if (blocks[child].height > max_child_height) {
                        max_child_height = blocks[child].height;
                        height = max_child_height + 2 * marginy;
                    }
                } else {
                    let default_text_length = this.textobjects[c].width();
                    this.textwidths[c] = default_text_length;
                    width += this.textwidths[c];
                    width += 2 * marginx;
                }
                child_num += 1;
            } else {
                width += this.textwidths[c];
                width += 2 * marginx;
            }
        }

        width += 2 * marginx;
        this.width = width;
        this.height = height;
        this.rectobject.width(this.width);
        this.rectobject.height(this.height);

        for (let a = 0; a < this.argboxobjects.length; a++) {
            argbox = this.argboxobjects[a];
            argbox.width(this.textwidths[a] + 2 * marginx);
            argbox.height(BLOCK_HEIGHT);
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
                    blocks[child].y = this.y + (this.height/2) - (blocks[child].height / 2);
                    blocks[child].x = this.x + childx;
                }
                child_num += 1;
            }
            childx += this.textwidths[c] + 2 * marginx;
        }

        let argx = marginx;
        for (let a = 0; a < this.argboxobjects.length; a++) {
            let argbox = this.argboxobjects[a];
            argbox.x(argx);
            argbox.y((this.height/2) - (BLOCK_HEIGHT / 2));
            argx += this.textwidths[a] + 2 * marginx;
        }

        let textx = 2 * marginx;
        for (let a = 0; a < this.textobjects.length; a++) {
            let text = this.textobjects[a];
            text.x(textx);
            text.y(this.height / 2 - 10);
            textx += this.textwidths[a] + 2 * marginx;
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

    constructor(id) {
        this.id = id
        this.x = 0;
        this.y = 0;
        this.height = BLOCK_HEIGHT;
        this.width = BLOCK_HEIGHT;
        this.children = [];
        this.text = ["text", "arg"];
        this.textwidths = [0, 0];
        this.textobjects = [];
        this.argboxobjects = [];
        this.rectobject = null;
        this.next = null;
        this.dragged = false;
        this.groupobject = null;
        this.children = null;
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
class PrintBlock extends StackBlock {
    name = "print";
    color = 6;
    skeleton = [0, 1];
    text = ["print", "Hello!"];

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
}

class XBlock extends ArgBlock {
    name = "x";
    color = 4;
    skeleton = [0];
    text = ["X"];
}
class YBlock extends ArgBlock {
    name = "y";
    color = 4;
    skeleton = [0];
    text = ["Y"];
}
class TimerBlock extends ArgBlock {
    name = "timer";
    color = 4;
    skeleton = [0];
    text = ["timer"];
}

class RedBlock extends StackBlock {
    name = "red";
    color = 0;
    skeleton = [0];
    text = ["red"];
}

class OrangeBlock extends StackBlock {
    name = "orange";
    color = 1;
    skeleton = [0];
    text = ["orange"];
}

class YellowBlock extends StackBlock {
    name = "yellow";
    color = 2;
    skeleton = [0];
    text = ["yellow"];
}

class GreenBlock extends StackBlock {
    name = "green";
    color = 3;
    skeleton = [0];
    text = ["green"];
}

class BlueBlock extends StackBlock {
    name = "blue";
    color = 4;
    skeleton = [0, 1, 0, 1, 0, 1];
    text = ["blue", "is", "the", "best", "color", "ever"];
}

class PurpleBlock extends StackBlock {
    name = "purple";
    color = 5;
    skeleton = [0];
    text = ["purple"];
}

class PinkBlock extends StackBlock {
    name = "pink";
    color = 6;
    skeleton = [0];
    text = ["pink"];
}

class AddBlock extends ArgBlock {
    name = "add";
    color = OPERATION_COLOR
    skeleton = [1, 0, 1];
    text = [" ", "+", " "];

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

    eval () {
        this.prepArgs();
        return Math.sin(parseFloat(this.args[0]));
    }
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

var blocks = []
//     new PrintBlock(),
//     new AddBlock(),
//     new MultiplyBlock(),
//     new SubtractBlock(),
//     new PrintBlock(),
//     new PrintBlock(),
//     new PrintBlock(),
//     new RedBlock(),
//     new OrangeBlock(),
//     new YellowBlock(),
//     new GreenBlock(),
//     new BlueBlock(),
//     new PurpleBlock(),
//     new PinkBlock(),
//     new ColorBlock(),
//     new XBlock(),
//     new YBlock(),
//     new SineBlock(),
//     new DivideBlock(),
//     new TimerBlock(),
// ]

var stacks = [
    [[0, "print", [1], ["Hello"]],
    [1, "add", [2, 3], ["", ""]],
    [2, "multiply", [-1, -1], [50, 40]],
    [3, "subtract", [-1, -1], [30, 20]],
    ],

    [[4, "print", [-1], ["Hello!"]],
    [5, "print", [-1], ["How are you?"]],
    [6, "print", [-1], ["I am well"]]
    ],

    [[7, "red", [], []],
    [8, "orange", [], []],
    [9, "yellow", [], []],
    [10, "green", [], []],
    [11, "blue", [-1, -1, -1], ["is", "best", "ever"]],
    [12, "purple", [], []],
    [13, "pink", [], []]
    ],

    [[14, "color", [15, 16, 17]],
    [15, "x", [], []],
    [16, "y", [], []],
    [17, "sine", [18], [90]],
    [18, "divide", [19, -1], ["", "10"]],
    [19, "timer", [], []]
    ]
]

for (let stack of stacks) {
    for (let stackitem of stack) {
        let blockname = stackitem[1];
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

            default: b = new Block();
        }
        blocks.push(b);
    }
}

var width = window.innerWidth - 500;
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

var rectX = stage.width() / 2 - 50;
var rectY = stage.height() / 2 - 25;

var marginx = 8;
var marginy = 4;
var strokeweight = 2;

var stackobjects = [];

for (var s = 0; s < stacks.length; s++) { 

    //var stackgroup = new Konva.Group({ draggable: true });

    stackheight = 0;
    blockheights = [];

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
    for (var b = 0; b < stacks[s].length; b++) {
        var block = blocks[stacks[s][b][0]];

        let textwidths = [];
        let textobjects = [];
        let argboxobjects = [];
        for (t = 0; t < block.text.length; t++) {
            textfill = (block.skeleton[t] == 1) ? 'black' : 'white';
            var text = new Konva.Text({
                text: block.text[t],
                fontSize: 20,
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
                height: BLOCK_HEIGHT,
                fill: argfill,
                stroke: highlight_colors[block.color],
                strokeWidth: argweight,
                opacity: opacity,
                cornerRadius: ROUNDEDNESS,
            });
            argboxobjects.push(argbox);

        }

        block.textwidths = textwidths;
        block.textobjects = textobjects;
        block.argboxobjects = argboxobjects;

        let r = ROUNDEDNESS;
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
            blockgroup.add(argbox);
        }
        for (const text of block.textobjects){
            blockgroup.add(text);
        }

        blockgroup.on('mouseover', function () {
            document.body.style.cursor = 'pointer';
            //this.children[0].fill('white');
        });

        blockgroup.on('mouseout', function () {
            hovered_block = this.block_id;
            document.body.style.cursor = 'default';
            this.children[0].fill(colors[blocks[this.block_id].color]);
        });

        blockgroup.block_stack = s;
        let block_id = stacks[s][b][0];
        blockgroup.block_id = block_id;
        //blocks[block_id].groupobject = blockgroup;

        blockgroup.on('dragmove', function () {

            blocks[this.block_id].dragged = false;

            //updateNeighborBlockPositions();

            this.offsetX(0);
            this.offsetY(0);
            blocks[this.block_id].x = this.absolutePosition().x;
            blocks[this.block_id].y = this.absolutePosition().y;

            for (var b2 = 0; b2 < stacks[this.block_stack].length; b2++) {
                //calculate location of each block
                var block2 = blocks[stacks[this.block_stack][b2][0]];
                block2.updateLocation();
            }
            //blocks[this.block_id].updateLocation();
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
                
                        for (let s2 = 0; s2 < stacks.length; s2++){
                            let prev = null;
                            for (let b3 = 0; b3 < stacks[s2].length; b3++){
                                let updated_block = blocks[stacks[s2][b3][0]];

                                // update 'next' values
                                updated_block.next = null;
                                if (updated_block.blocktype == 0) {
                                    if (prev != null) {
                                        blocks[prev].next = stacks[s2][b3][0];
                                    }
                                    prev = stacks[s2][b3][0];
                                }
                                // update stack values
                                updated_block.groupobject.block_stack = s2;
                                updated_block.children = stacks[s2][b3][2];
                                updated_block.block_stack = s2;

                                // update how it looks
                                updated_block.updateSize();
                                updated_block.updateLocation();
                            }
                        }

                        console.log(stacks);
                        return;
                    }
                }
            }
        });

        blockgroup.on('click', function () {
            for (i = 0; i < stacks[this.block_stack].length; i++) {
                blocks[stacks[this.block_stack][0][0]].eval();
            }
        });

        layer.add(blockgroup);
    }

    var stackgroup = new Konva.Group();

    var stackrect = new Konva.Rect({
        x: 0,
        y: 0,
        fill: "white",
        opacity: 0.5,
        width: 50,
        height: 50,
    });

    stackgroup.add(stackrect);

    layer.add(stackgroup);
    stackobjects.push(stackgroup);

    // stackgroup.on('mouseover', function () {
    //     document.body.style.cursor = 'pointer';
    //     // let objects = this.children[0].children;
    //     // for (object of objects) {
    //     //     object.fill('white');
    //     // }
    // });
    // stackgroup.on('mouseout', function () {
    //     document.body.style.cursor = 'default';
    // });
    // stackgroup.block_stack = s;
    // stackgroup.on('click', function () {
    //     for (i = 0; i < stacks[this.block_stack].length; i++) {
    //         blocks[stacks[this.block_stack][0][0]].eval();
    //     }
    // });
    
    //layer.add(stackgroup);
    stage.add(layer);
}