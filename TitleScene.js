class TitleScene extends Phaser.Scene {
    constructor(){
        super('TitlePage');

    }
   
    preload () {
        this.load.html('nameform', 'nameform.html');
        this.load.atlas('cards', 'src/assets/cards.png', 'src/assets/cards.json');
        this.load.image('helptext','src/assets/helptext.png')
        this.load.image('sign','src/assets/bid4pp.png')
        this.load.image('bg-cards','src/assets/bg.jpg')
    
        
    }
    create () {
        
        let data = [];
        let scene = this.scene;
        // --- accepts data from url
        // var queryString = location.search.substring(1);
        // console.log('querystring',queryString);
        // if (queryString.length > 0) {
        //     let data = queryString;
        //     scene.start('playGame', data);
        // }

        let bg1 = this.add.sprite(0,0,'bg-cards').setScale(0.8,0.8).setOrigin(0,0);
        
        //let background = this.add.sprite(645,400, 'bg').setScale(0.6,0.6);
        let sign1 = this.add.sprite(635, 100,'sign');
        let helptext = this.add.sprite(635,200, 'helptext');
        let card1 = this.add.sprite(600, 400, 'cards', 'js' );
        let card2 = this.add.sprite(620, 400, 'cards', 'jd' );
        let card3 = this.add.sprite(640, 400, 'cards', 'jc' );
        let card4 = this.add.sprite(660, 400, 'cards', 'jh' );
        card1.rotation = -0.5;
        card2.rotation = -0.25;
        card3.rotation = .25;
        card4.rotation = .5;

        var element = this.add.dom(625, 610).createFromCache('nameform');

        element.addListener('click');

        element.on('click', function (event) {

            if (event.target.name === 'playButton')
            {
                var inputText = this.getChildByName('nameField');
                if (inputText.value !== '')
                {
                   
                    data = inputText.value;
                    scene.start('playGame', data);
                }
                
            } 
            if (event.target.name === 'instructions'){

                scene.start('instructionPage');
            }
            
        });
        this.input.keyboard.on('keydown-ENTER', function (event){

            var inputVal = element.getChildByName('nameField');
            if (inputVal.value !== '')
            {
                data = inputVal.value;
                scene.start('playGame', data); 
            }
        
        });
    
    

       

       
    }
    update(){


    }
}
export default TitleScene;