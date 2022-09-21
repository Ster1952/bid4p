class InstructionScene extends Phaser.Scene {
    constructor(){
        super('instructionPage');
    }
   
    preload () {
        this.load.html('instructionform', 'instructionform.html');
        this.load.image('title','src/assets/instructions.png');
    }

    create () {
    
        let background = this.add.sprite(645,50, 'title');
    
        let scene = this.scene;
        var element = this.add.dom(650, 490).createFromCache('instructionform');
    

        element.addListener('click');

        element.on('click', function (event) {

            if (event.target.name === 'return')
            {
                    scene.start('TitlePage');
            } 
        });
    }
}
export default InstructionScene;