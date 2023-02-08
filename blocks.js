console.log("1");

var c = document.getElementById("canvas");
var ctx = c.getContext("2d");

// let colors = {black: "#000000", red: "#b40022", brown: "#c9921b", orange: "#eba800", yellow: "#facd02", lime: "#cbe000", darkgreen: "#028b53", blue: "#0fb5c5", grey: "#9dc9d4", lightblue: "#cbe8f9", lavender: "#d6cade", skin: "#ffd3c7", white: "#ffffff"};

// let colors = ["#b40022", "#c9921b", "#eba800", "#facd02",  "#cbe000", "#028b53",  "#0fb5c5", "#9dc9d4",  "#cbe8f9", "#d6cade", "#ffd3c7"];

const colors = ['#DA0000', '#CB5E00', '#998300', '#008430', '#006DCB', '#84004F', '#CB008B'];
const highlight_colors = ["#A2003C", "#A02E00", "#576400", "#006273", "#1637A8", , "#450053", "#860099"];

const OPERATION_COLOR = 3;
const FLOW_COLOR = 2;

let hovered_block = 0;

class Block {

    updateSize () {

        let width = 0;
        let height = 30;
        height += marginy * 2;

        let max_child_height = 0;
        let child_num = 0;
        for (let c = 0; c < this.skeleton.length; c++) {
            if (this.skeleton[c] == 1) {
                if (this.children[child_num] != null) {
                    let child = this.children[child_num];
                    blocks[child].updateSize();
                    this.textwidths[c] = blocks[child].width - 2 * marginx;
                    width += blocks[child].width;
                    if (blocks[child].height > max_child_height) {
                        max_child_height = blocks[child].height;
                        height = max_child_height + 2 * marginy;
                    }
                } else {
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
            argbox.height(this.height - 2 * marginy);
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
                if (this.children[child_num] != null) {
                    let child = this.children[child_num];
                    blocks[child].y = this.y + marginy;
                    blocks[child].x = this.x + childx;
                }
                child_num += 1;
            }
            childx += this.textwidths[c] + 2 * marginx;
        }

        let argx = marginx;
        for (let a = 0; a < this.argboxobjects.length; a++) {
            let argbox = this.argboxobjects[a];
            argbox.x(this.x + argx);
            argbox.y(this.y + marginy);
            argx += this.textwidths[a] + 2 * marginx;
        }

        let textx = 2 * marginx;
        for (let a = 0; a < this.textobjects.length; a++) {
            let text = this.textobjects[a];
            text.x(this.x + textx);
            text.y(this.y + this.height / 2 - 10);
            textx += this.textwidths[a] + 2 * marginx;
        }

        this.rectobject.x(this.x);
        this.rectobject.y(this.y);

    }

    prepArgs() {
        this.args = [];
        let child_num = 0;
        for (let i = 0; i < this.skeleton.length; i++) {
            if (this.skeleton[i] == 1) {
                if (this.children[child_num] == null) {
                    this.args.push(this.text[i]);
                } else {
                    this.args.push(blocks[this.children[child_num]].eval());
                }
                child_num += 1;
            }
        }
    }

    color = 1;

    blocktype = 0;

    constructor(id) {
        this.id = id
        this.x = 0;
        this.y = 0;
        this.height = 30;
        this.width = 30;
        this.children = [];
        this.text = ["text", "arg"];
        this.textwidths = [0, 0];
        this.textobjects = [];
        this.argboxobjects = [];
        this.rectobject = null;
        this.next = null;
        this.dragged = false;
        this.groupobject = null;
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
    color = 6;
    skeleton = [0, 1];
    text = ["print", "Hello!"];

    eval () {
        this.prepArgs();
        console.log(this.args[0]);
        return null;
    }
}

class RedBlock extends StackBlock {
    color = 0;
    skeleton = [0];
    text = ["red"];
}

class OrangeBlock extends StackBlock {
    color = 1;
    skeleton = [0];
    text = ["orange"];
}

class YellowBlock extends StackBlock {
    color = 2;
    skeleton = [0];
    text = ["yellow"];
}

class GreenBlock extends StackBlock {
    color = 3;
    skeleton = [0];
    text = ["green"];
}

class BlueBlock extends StackBlock {
    color = 4;
    skeleton = [0, 1, 0, 1, 0, 1];
    text = ["blue", "is", "the", "best", "color", "ever"];
}

class PurpleBlock extends StackBlock {
    color = 5;
    skeleton = [0];
    text = ["purple"];
}

class PinkBlock extends StackBlock {
    color = 6;
    skeleton = [0];
    text = ["pink"];
}

class AddBlock extends ArgBlock {
    color = OPERATION_COLOR
    skeleton = [1, 0, 1];
    text = [" ", "+", " "];

    eval () {
        this.prepArgs();
        return parseFloat(this.args[0]) + parseFloat(this.args[1]);
    }
}

class SubtractBlock extends ArgBlock {
    color = OPERATION_COLOR
    skeleton = [1, 0, 1];
    text = ["4890", "-", "23"];

    eval () {
        this.prepArgs();
        return parseFloat(this.args[0]) - parseFloat(this.args[1]);
    }
}

class MultiplyBlock extends ArgBlock {
    color = OPERATION_COLOR
    skeleton = [1, 0, 1];
    text = ["5", "*", "4"];

    eval () {
        this.prepArgs();
        return parseFloat(this.args[0]) * parseFloat(this.args[1]);
    }
}


function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

var blocks = [
    new PrintBlock(),
    new AddBlock(),
    new MultiplyBlock(),
    new SubtractBlock(),
    new PrintBlock(),
    new PrintBlock(),
    new PrintBlock(),
    new RedBlock(),
    new OrangeBlock(),
    new YellowBlock(),
    new GreenBlock(),
    new BlueBlock(),
    new PurpleBlock(),
    new PinkBlock(),
]

var stacks = [
    [[0, [1]],
    [1, [2, 3]],
    [2, []],
    [3, []],
    ],

    [[4, []],
    [5, []],
    [6, []]
    ],

    [[7, []],
    [8, []],
    [9, []],
    [10, []],
    [11, []],
    [12, []],
    [13, []],
    ]
]

// c.width  = window.innerWidth;
// c.height = window.innerHeight;

// var width = c.width
// var height = c.height


// var width = window.innerWidth;
// var height = window.innerHeight;

var width = window.innerWidth - 480;
var height = window.innerHeight - 480;

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

for (var s = 0; s < stacks.length; s++) { 

    //var stackgroup = new Konva.Group({ draggable: true });

    stackheight = 0;
    blockheights = [];

    for (var b = 0; b < stacks[s].length; b++) {
        var block = blocks[stacks[s][b][0]];
        block.children = stacks[s][b][1];
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
                height: 30,
                fill: argfill,
                stroke: highlight_colors[block.color],
                strokeWidth: argweight,
                opacity: opacity
            });
            argboxobjects.push(argbox);

        }

        block.textwidths = textwidths;
        block.textobjects = textobjects;
        block.argboxobjects = argboxobjects;

        var rect = new Konva.Rect({
            fill: colors[block.color],
            stroke: highlight_colors[block.color],
            strokeWidth: strokeweight,
        });
        block.rectobject = rect;
        // can (and should ) be optimized
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

        var blockgroup = new Konva.Group({draggable: true});

        blockgroup.add(block.rectobject);
        for (const argbox of block.argboxobjects){
            blockgroup.add(argbox);
        }
        for (const text of block.textobjects){
            blockgroup.add(text);
        }

        blockgroup.on('mouseover', function () {
            document.body.style.cursor = 'pointer';
                this.children[0].fill('white');
        });

        blockgroup.on('mouseout', function () {
            hovered_block = this.block_id;
            document.body.style.cursor = 'default';
            this.children[0].fill(colors[blocks[this.block_id].color]);
        });

        blockgroup.block_stack = s;
        let block_id = stacks[s][b][0];
        blockgroup.block_id = block_id;
        blocks[block_id].groupobject = blockgroup;

        blockgroup.on('dragmove', function () {

            blocks[this.block_id].dragged = false;

            //updateNeighborBlockPositions();

            this.offsetX(this.absolutePosition().x);
            this.offsetY(this.absolutePosition().y);
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
            blocks[this.block_id].dragged = true;
            for (let s = 0; s < stacks.length; s++) {
                for (let b = 0; b < stacks[s].length; b++) {
                    if (stacks[s][b][0] == this.block_id && b > 0) {
                        let oldstack = stacks[s].slice(0, b);
                        let newstack = stacks[s].slice(b, stacks[s].length);
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