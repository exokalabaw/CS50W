const qs = JSON.parse(document.getElementById('quizitems').textContent);
const ac = mac(qs)
const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
function App({ id , b, quizid}){
    const [started, setStarted] = React.useState(false)
    const [questions, setQuestions] = React.useState(ac)
    const bmd = b =='1';
    const [bookmarked, setBookmarked] = React.useState(bmd)
    
    if(!started){
        return(
            <div>
                <div class="pb-2">
                    <small><a href="" onClick={()=>toggleBookmark(setBookmarked, bookmarked, questions[0].quiz_id)}>{bookmarked ? "remove bookmark": "add bookmark"} </a></small>
                 </div> 
                 <button class="btn btn-primary"onClick={()=>setStarted(true)}>Start quiz</button>
            </div>
           
        ) 
        }
    else{
        return(
            <div>
                <Questions qs={questions} setQs={setQuestions}/>
                <button class="btn btn-primary mt-2" onClick={()=>checkResults(questions, quizid)}>Submit</button>
            </div>            
        )
    }
        
}

// subcomponents
function Questions({qs, setQs}){
    const [questions, setQuestions] = React.useState([...qs])
    return(
        <div id="questions_container">
            {
                questions.map((q,index)=>
                    {
                      return( 
                      <div key={q.id} class="mb-4">
                        <h5 class="mb-3">{q.question}({q.quiz_type})</h5>
                        <Possible_answers question_index={index} pa={q.answers} ua={q.user_answer} qt={q.quiz_type} setQuestions={setQuestions} q={questions}/>
                      </div>
                      )
                    }
                )
                }
        </div>
    )
}
function Possible_answers({pa, qt, question_index, setQuestions, ua, q}){
    //the answers are the saved answerlist in the order saved
    const [answers, setAnswers] = React.useState([...pa]);
    const [oaLifted, setOaLifted] = React.useState(null);
    const [oaOver, setOaover] = React.useState(null);
    //oaorder is the ordered array of answers that includes the answer text, ids etc
    const [oaOrder, setOaorder] = React.useState([]);
    //this is just an array with the sequence of ids of answers, will be jumbled when the 
    React.useEffect(()=>{
        if(qt == "oa" && oaLifted != true){
            if(oaLifted == null){
                initOaorder(answers, setOaorder)
            }else if(oaLifted == false){
                rearrangeOaOder( answers, setOaorder, ua )
            }
            
        }
    },[oaLifted])
    

    if(qt == "txt"){
        //textbox answer
        return(
            <input type="text" class="border-gray-500 border" name={`answer${question_index}`} value={ua[0] == null ? "" : ua[0]} onChange={e=>processInput(e, setQuestions, question_index, q)}></input>
        )
    }
    //this is where you ended last night. . . .make two sets of ordered answer questions to check for cross question issues
    //list down what happens when you run the function to re order the oas after an item is dragged to another spot
    else if(qt=="oa"){
        //ordered answer 
        return(
            <div>
                {
                    oaOrder.map((a,index)=>{
                        return(
                            <div key={index} class={`p-2 border border-gray-500 answeritem draggable`} data-answerid={a.id}  data-questionnumber={question_index} draggable  onDragStart={()=>{setOaLifted(true)}} onDragEnd={e=>{processOA(e,index, oaOver, setQuestions, setOaLifted,q, oaOrder)}} onDragOver={e=>{oaOver != index && setOaover(index); e.preventDefault()}}>
                                {a.possible_answer}
                            </div>
                        )
                    })
                }
            </div>
        )
    }else if(qt=="mcoa"){
        //multiple choice multiple one answer functions

        return(
            <div >
                {
                    answers.map((b,index)=>{
                        
                        return(
                            <div onClick={()=>{processMCOA(index, setQuestions, question_index, q)}}data-id={b.id} class={`p-2 border border-gray-500 answeritem ${ua[0] == index ? "selected":''}`}>{b.possible_answer}</div>
                        )
                    })
                }
            </div>
        )
    }else if(qt == 'mcma'){
        //multiple choice multiple answer functions
        return(
            <div >
                {
                    answers.map((b,index)=>{
                        let selected = false;
                        
                        let f = q[question_index].user_answer;
          
                        f.forEach(g=>{
                            if (g == index){
                                selected = true;
                            }
                        })
                        return(
                            
                                <div onClick={()=>{processMCMA(index, setQuestions, question_index, q)}} class={`p-2 border border-gray-500 answeritem ${selected ? "selected":''}`}  >{b.possible_answer}</div>
                            
                            
                        )
                    })
                }
            </div>
        )
    }
    

}

// functions
// toggle bookmarking of quiz
async function toggleBookmark(a, b, c){
    try {
        const response = await fetch(`/tb/${b}/${c}`)
        const j = await response.json()
        if (!response.ok || j.update == "error"){
            throw new Error(response.statusText)
        }
        a(b? false:true)
    }catch(error){
        alert("temporary error")
    }
    
}
//add user answers key value to question object
function mac(c){
    let catched=[]
    c.forEach(k=>{
        const q = {
            ...k,
            user_answer: []
        }
        catched.push(q);
    })
    return catched;
}

//process input
function processInput(e, setQuestions, question_index, q){
    let b =[...q] ;
    b[question_index].user_answer = [e.target.value];
    setQuestions(b)
}
function processMCOA(answered_index, setQuestions,question_index,q){
    let g = [...q];
    g[question_index].user_answer = [answered_index];
    setQuestions(g)

}
function processMCMA(answered_index, setQuestions,question_index,q){
    let h = [...q];
    let savedAnswers = h[question_index].user_answer;
    let newAnswer = true;
    function filterAnswer(pa){
        if(pa == answered_index){
            newAnswer = false;
        }
        return pa != answered_index;
    }
    let newset = savedAnswers.filter(filterAnswer)
    if (newAnswer){
        newset.push(answered_index)
    }
    h[question_index].user_answer = newset;
    setQuestions(h);

}

function processOA(e,index, oaOver, setQuestions, setOaLifted,q, oaOrder){
    // make a simple array of the order of answer ids 
    let idarray = []
    oaOrder.forEach(g=>{
        idarray.push(g.id)
    })
    const newArrayOrder = reorderArray(index, oaOver, idarray)
    const questionIndex = e.target.dataset['questionnumber']
    const questions = [...q]
    questions[questionIndex].user_answer = newArrayOrder;

    // splice the array so that the order is change according to the drop event
    // set questions so that the answer to the specific question id saves the new array order from last step
    // set oalifted to false so that the react will rearrange the items 
    setOaLifted(false)
    setQuestions(questions)
}

function rearrangeOaOder(answers, setOaorder, ua){
    let newArrangement = []
    ua.forEach(k=>{
        answers.forEach(b=>{
            b.id == k && newArrangement.push(b);
        })
    }
    )
    setOaorder(newArrangement)
}


// 
function initOaorder(answers, setOaorder){
    // if pa is empty just go through the answers.. if it isn't re make an array with the re arranged items
    let newOrder = []
        answers.forEach(f=>{
            const a = {
                id:f.id,
                possible_answer:f.possible_answer
            }
            newOrder.push(a)
        })
            // let tempo = [];
            // pa.forEach(p=>{
            //     newOrder.forEach(n=>{
            //         if(p.id == n.id){
            //             tempo.push(n)
            //         }
            //     })  
            // })
            // newOrder = tempo;
        const b = shuffleArray(newOrder);
        setOaorder(b);
}

//shuffle array function for first time loading of oa items
        function shuffleArray(array){
            for (let i = array.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              const temp = array[i];
              array[i] = array[j];
              array[j] = temp;
            }
            return array;
          }

function reorderArray(index, destination, array){
    const migrant = array[index]
    if(index !=  destination){
        if (index < destination){
            array.splice(destination + 1, 0, migrant)
        }else{
            array.splice(destination , 0, migrant)
        }
        const originalmigrantindex = index < destination ? index : index + 1;
        array.splice(originalmigrantindex, 1);
    }
    return array;
}
//check answer results
async function checkResults(questions, quizid){
    const body = {"quizid": quizid}
    const ans = [];
    questions.forEach(g=>{
        const a = {
            question_id:g.id,
            answers: g.user_answer
        }
        ans.push(a)
    })
    console.log("quiz id is "+ quizid)
    body["answers"] = ans
    const strfied = JSON.stringify(body)
    console.log(strfied)
    const request = new Request(
        '/checkanswers',
        {
            method: 'POST',
            headers: {'X-CSRFToken': csrftoken},
            mode: 'same-origin', // Do not send CSRF token to another domain.
            body: strfied

        }
    );
    
    const response =  await fetch(request)
    const result = await response.json()
    console.log(result)
    //extract user answers from questions props
    

}