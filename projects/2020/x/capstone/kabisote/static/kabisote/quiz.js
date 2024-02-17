const qs = JSON.parse(document.getElementById('quizitems').textContent);
const ac = mac(qs)
const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
function App({ id , b, quizid}){
    // pre - before taking the test, taking - taking the test, results - viewing results lightbox, review - review items
    const [status, setStatus] = React.useState("pre")
    const [questions, setQuestions] = React.useState(ac)
    const bmd = b =='1';
    const [bookmarked, setBookmarked] = React.useState(bmd)
    const [validated, setValidated] = React.useState(false)
    const [results, setResults] = React.useState(null)
    
    if(status == "pre"){
        return(
            <div>
                <div class="pb-2">
                    <small><a onClick={()=>toggleBookmark(setBookmarked, bookmarked, quizid)}>{bookmarked ? "remove bookmark": "add bookmark"} </a></small>
                    
                 </div> 
                 <button class="btn btn-primary"onClick={()=>setStatus("taking")}>Start quiz</button>
            </div>
           
        ) 
        }
    else{
        return(
            <div>
                <div>
                    <Questions qs={questions}  validated={validated} setValidated={setValidated} results={results} status={status}/>
                    <button class="btn btn-primary mt-2"  disabled={!validated || status != "taking"} onClick={()=>checkResults(questions, quizid, setResults, setStatus)}>Submit</button>
                </div>        
                {
                    status == "results" &&
                        
                        <Resultsmodal results={results} setStatus={setStatus}/>
                        
                 }
            </div> 
        )
    }
        
}

// subcomponents
function Questions({qs, setValidated, results, status}){
    const [questions, setQuestions] = React.useState([...qs])
    
   
   
    return(
        <div id="questions_container">
            {
                questions.map((q,index)=>
                    {
                      return( 
                      <div key={q.id} class={status == 'review' ?results.user_answers && results.user_answers[index].correct ? 'correct mt-4 mb-3':'incorrect mt-4 mb-3':'mt-4 mb-3'}>
                        
                        
                        
                        <h5 class="mb-0">{index + 1 }. {q.question}</h5>
                        <small >({q.quiz_type == "mcma" ? "multiple choice, multiple answer": q.quiz_type == "oa" ? "ordered answer" : q.quiz_type == "mcoa" ? "multiple choice, one answer": "type your answer"}, {q.points} point{q.points != 1 && "s"})</small>
                        <Possible_answers question_index={index} pa={q.answers} ua={q.user_answer} qt={q.quiz_type} setQuestions={setQuestions} q={questions} setValidated={setValidated} status={status}/>
                        {
                            status == "review" && <ViewAnswer index={index} results={results}/>
                        }
                        
                      </div>
                      )
                    }
                )
                }
        </div>
    )
}
function Possible_answers({pa, qt, question_index, setQuestions, ua, q , setValidated, status}){
    //the answers are the saved answerlist in the order saved
    const [answers, setAnswers] = React.useState([...pa]);
    //lifted is when the user picks the item up via drag action
    const [oaLifted, setOaLifted] = React.useState(null);
    const [oaOver, setOaover] = React.useState(null);
    //oaorder is the ordered array of answers that includes the answer text, ids etc
    const [oaOrder, setOaorder] = React.useState([]);
    //this is just an array with the sequence of ids of answers, will be jumbled when the 
    React.useEffect(()=>{
        if(qt == "oa" && oaLifted != true){
            if(oaLifted == null){
                initOaorder(answers, setOaorder, setQuestions, q, question_index)
            }else if(oaLifted == false){
                rearrangeOaOder( answers, setOaorder, ua )
            }
            
        }
    },[oaLifted])
    

    if(qt == "txt"){
        //textbox answer
        return(
            <div class="pt-2">
                 <input type="text" disabled={status != "taking"} class="border-gray-500 border p-2 border-gray-500" name={`answer${question_index}`} value={ua[0] == null ? "" : ua[0]} onChange={e=>{status == "taking" && processInput(e, setQuestions, question_index, q, setValidated)}}></input>
            </div>
           
        )
    }
    //this is where you ended last night. . . .make two sets of ordered answer questions to check for cross question issues
    //list down what happens when you run the function to re order the oas after an item is dragged to another spot
    else if(qt=="oa"){
       
        
        //ordered answer 
        return(
            <div class="reorderer pt-2">
                
                {
                    oaOrder.map((a,index)=>{
                        
                        return(
                            <div key={index} class={`p-2 border border-gray-500 answeritem draggable`} /*data-answerid={a.id}*/  data-questionnumber={question_index} draggable={status == "taking" && true}  onDragStart={()=>{setOaLifted(true)}} onDragEnd={e=>{processOA(question_index,index, oaOver, setQuestions, setOaLifted,q, oaOrder)}} onDragOver={e=>{oaOver != index && setOaover(index); e.preventDefault()}}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="16" fill="currentColor" class="bi bi-grip-vertical me-2 mb-1" viewBox="0 0 16 16">
                                <path d="M7 2a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0M7 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0M7 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0m-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0m-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0"/>
                                </svg>{a.possible_answer}
                            </div>
                        )
                    })
                }
            </div>
        )
    }else if(qt=="mcoa"){
        //multiple choice multiple one answer functions
        
        return(
            <div class="pt-2">
                {
                    answers.map((b,index)=>{
                        
                        return(
                            <div onClick={()=>{status == "taking" && processMCOA(index, setQuestions, question_index, q, b.id, setValidated)}} data-id={b.id} class={`p-2 border border-gray-500 answeritem ${ua[0] == index ? "selected":''}`}>{b.possible_answer}</div>
                        )
                    })
                }
            </div>
        )
    }else if(qt == 'mcma'){
        //multiple choice multiple answer functions
        return(
            <div class="pt-2">
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
                            
                                <div onClick={()=>{status == "taking" && processMCMA(index, setQuestions, question_index, q, b.id, setValidated)}} class={`p-2 border border-gray-500 answeritem ${selected ? "selected":''}`}  >{b.possible_answer}</div>
                            
                            
                        )
                    })
                }
            </div>
        )
    }
    

}

function Resultsmodal({results, setStatus}){
    console.log('results in modal : ' +results)
    return (
        <div class="modal block"  >
            <div class="modal-dialog modal-dialog-centered">
              <div class="modal-content text-center">

                <div class="modal-body py-5" id="resultviewer" >
                <h5>Your score is :</h5> <br/><h3>{results.score_user}/{results.score_max}</h3>
                    
                </div>
                <div class="modal-footer ">
                  <button type="button" class="btn btn-primary" data-bs-dismiss="modal" id="reviewBtn" onClick={()=>setStatus("review")}>Review answers</button>
                  
                  <a type="button" class="btn btn-primary" href={`/quiz/${results.quiz_id}`}>Exit </a>
                </div>
              </div>
            </div>
          </div>
    )
}

function ViewAnswer({index, results}){
    const [viewAnswer, setViewAnswer] = React.useState(false)
    if(viewAnswer){
        const ans = results.user_answers[index].answerstrings

        if(results.user_answers[index].question_type == "oa"){
            return(
            
                <ol class="text-success mt-2">
                    {
                        ans.map(f=>{
                            return(<li class="text-success">{f}</li>)
                        })
                    }
                </ol>
                )
        }else{
            return(
            
                <ul class="text-success mt-2">
                    {
                        ans.map(f=>{
                            return(<li class="text-success">{f}</li>)
                        })
                    }
                </ul>
                )
        }
        
    }else{
        return(
            <div>
                { results.user_answers[index].correct ? <small class="text-success">Correct!</small>:<small class="text-danger">Incorrect</small>}
                <p onClick={()=>setViewAnswer(true)} class="viewclick"><small>View answer</small></p>
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
            user_answer: [],
            user_answerid:[]
        }
        catched.push(q);
    })
    return catched;
}

//process input
function processInput(e, setQuestions, question_index, q, setValidated){
    let b =[...q] ;
    b[question_index].user_answer = [e.target.value];
    const validated = validateForm(q)
    setValidated(validated)
    setQuestions(b)
}
function processMCOA(answered_index, setQuestions,question_index,q, id, setValidated){
    let g = [...q];
    
    g[question_index].user_answer = [answered_index];
    g[question_index].user_answerid = [id]
    setQuestions(g)
    const validated = validateForm(q)
    setValidated(validated)

}
function processMCMA(answered_index, setQuestions,question_index,q, id, setValidated){
    let h = [...q];
    let savedAnswers = h[question_index].user_answer;
    let savedIds = h[question_index].user_answerid;
    //check wether use clicked on new answer or chosen answer
    let newAnswer = true;
    //if the answered index matches the current iteration, it's not a new answer.. it should be removed
    function filterAnswer(pa){
        if(pa == answered_index){
            newAnswer = false;
        }
        return pa != answered_index;
    }
    function filterid(k){
        return k != id
    }
    let newset = savedAnswers.filter(filterAnswer)
    let newid = savedIds.filter(filterid)
    if (newAnswer){
        newset.push(answered_index)
        newid.push(id)
    }
    h[question_index].user_answer = newset;
    h[question_index].user_answerid = newid;
    setQuestions(h);
    const validated = validateForm(q)
    setValidated(validated)

}

function processOA(e,index, oaOver, setQuestions, setOaLifted,q, oaOrder){
    // make a simple array of the order of answer ids 
    let indexarray = []
    oaOrder.forEach(g=>{
        indexarray.push(g.id)
    })
    const newArrayOrder = reorderArray(index, oaOver, indexarray)
    const questionIndex = e
    const questions = [...q]
    questions[questionIndex].user_answer = newArrayOrder;


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
function initOaorder(answers, setOaorder, setQuestions, q, questionIndex){
    // if pa is empty just go through the answers.. if it isn't re make an array with the re arranged items
    let newOrder = []
        answers.forEach(f=>{
            const a = {
                id:f.id,
                possible_answer:f.possible_answer
            }
            newOrder.push(a)
        })
        let fakeUserAnswers = []
        
        const b = shuffleArray(newOrder);
        b.forEach(k=>{
            fakeUserAnswers.push(k.id)
        })
        const questions = [...q]
        questions[questionIndex].user_answer = fakeUserAnswers;
        setQuestions(questions)
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
//validate form
function validateForm(q){
    let validated = true
    q.forEach(t=>{
        if (validated && t.quiz_type != "oa"){
                const ar = t.user_answer;
                if(ar.length == 0 ){
                    validated = false;
                }
        }
       
    })
    return validated
}
//check answer results
async function checkResults(questions, quizid, setResults, setStatus){
    const body = {"quizid": quizid}
    const ans = [];
    questions.forEach(g=>{
        const a = {
            question_id:g.id,
            answers: g.user_answer,
            answerids: g.user_answerid
        }
        
        ans.push(a)
    })
    body["answers"] = ans
    const strfied = JSON.stringify(body)
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
    setResults(result)
    setStatus("results")
    //extract user answers from questions props
    

}