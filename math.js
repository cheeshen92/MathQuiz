var answer;
var score = 0;
var background_image = [];

function nextQuestion() {
    const n1 = Math.floor(Math.random() * 5);
    document.getElementById('n1').innerHTML = n1;
    const n2 = Math.floor(Math.random() * 6);
    document.getElementById('n2').innerHTML = n2;
    answer = n1 + n2;
}

function checkAnswer(){

    const prediction = predictImage();
    console.log(answer);
    console.log(prediction);

    if (prediction == answer) {
        score++;
        if (score<=6){
            background_image.push(`url('images/background${score}.svg')`);
            document.body.style.backgroundImage = background_image;
        } else {
            alert('Maximum score achieved! Congratulations.')
            score = 0;
            background_image = [];
            document.body.style.backgroundImage = background_image;
        }
        console.log(score);
    } else {
        if(score != 0) {score--};
        alert('Oops! Try Again!');
        setTimeout(function(){
            background_image.pop();
            document.body.style.backgroundImage = background_image;  
        }, 1000)
        console.log(score);
    }

}