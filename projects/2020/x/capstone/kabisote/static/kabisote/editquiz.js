const ei = JSON.parse(document.getElementById('quizitems').textContent);
const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

function App({ id , b, quizid}){
    const [questions, setQuestions] = React.useState(ei)
    // can be mac, txt, oa
    const [editing, setEditing] = React.useState(false)
    console.log(questions)
    return(
        <div clas="eqcontainer">
            <div id="myanswers" class="mt-4">
                {
                    questions.map(question=>{
                        return(<Question question={question} />)
                    })
                }
            </div>
            <QuestionFormsApp editing={editing} setEditing={setEditing} />
            
            
        </div>
    )
}
// question and answer display
function Question({question}){
    const at = {
        oa: 'ordered answer',
        mcma: 'multiple choice, multiple answer',
        mcoa : 'multiple choice, multiple answer',
        txt : 'textbox answer'
    }
    return(
        <div >
            <h5>{question.question} <br/></h5>
            <small>({at[`${question.quiz_type}`]}, {question.points} point{question.points > 1 && "s"})</small>
            {
                question.quiz_type == "oa"?
                            <ol class="my-2">
                            {
                                question.answers.map(a=>{
                                    return(
                                        <PossibleAnswer answer={a} quiz_type={question.quiz_type}/>
                                    )
                                })
                            }
                            </ol>
                :
                <ul class="my-2">
                {
                    question.answers.map(a=>{
                        return(
                            <PossibleAnswer answer={a} quiz_type={question.quiz_type}/>
                        )
                    })
                }
                </ul>
    


            }
            
        </div>
    )
}

function PossibleAnswer({answer, quiz_type}){
    return(
        <li >
            {quiz_type == "txt" || quiz_type == "oa" ? null: answer.is_correct ?<small class="text-success">(correct) </small> :<small class="text-danger">(incorrect) </small> }
            {answer.possible_answer}
        </li>
    )
}

// question and answer forms
function QuestionFormsApp({setEditing}){
    const [currentEdit, setCurrentEdit] = React.useState(null)
    
    switch(currentEdit){
        case null:
            return(
                <QuestionButtons setCurrentEdit={setCurrentEdit} />
            )
        case 'txt':
            return(
                <AddEditQuestion setCurrentEdit={setCurrentEdit} q={null} type={currentEdit} a={[{answer: "", is_correct: true, answer_weight: 0, type: currentEdit}]}/>
            )
        case 'mcoa':
            return(
                <AddEditQuestion setCurrentEdit={setCurrentEdit} type={currentEdit} a={[{answer: "", is_correct: true, answer_weight: 0, type: currentEdit}, {answer: "", is_correct: false, answer_weight: 1, type: currentEdit}]}/>
            )
        case 'mcma':
            return(
                <AddEditQuestion setCurrentEdit={setCurrentEdit} type={currentEdit} a={[{answer: "", is_correct: true, answer_weight: 0, type: currentEdit}, {answer: "", is_correct: false, answer_weight: 1, type: currentEdit}]}/>
            )
        case 'oa':
            return(
                <AddEditQuestion setCurrentEdit={setCurrentEdit} q={null} type={currentEdit} a={[{answer: "", is_correct: true, answer_weight: 0, type: currentEdit}, {answer: "", is_correct: true, answer_weight: 1, type: currentEdit}]}/>
            )
    }
    
}
function QuestionButtons({setCurrentEdit}){
    
    return(
        <div id="addlinks" class="bg-light">
                <h6>Add:</h6>
                <button class="btn btn-secondary btn-sm me-1" onClick={()=>setCurrentEdit('txt')}>Textbox</button>
                <button class="btn btn-secondary btn-sm me-1" onClick={()=>setCurrentEdit('mcoa')}>Multiple Choice, One Answer</button>
                <button class="btn btn-secondary btn-sm me-1" onClick={()=>setCurrentEdit('mcma')}>Multiple Choice, Multiple Answer</button>
                <button class="btn btn-secondary btn-sm me-1" onClick={()=>setCurrentEdit('oa')}>Ordered Answer</button>
        </div>
    )
}

function AddEditQuestion({setCurrentEdit, q, a, type}){
    const [question, setQuestion] = React.useState(q)
    // {answer:answer, is_correct, is_correct, answer_weight}
    const [answers, setAnswers] = React.useState(a)
    //disables add and rearrange buttons when a field is empty
    const [addable, setAddable] = React.useState(false)
    const [saveable, setSaveable] = React.useState(false)
    const addHeaders = React.useRef(
        {
        "oa":"Add an ordered answer question", 
        "txt": "Add a textbox answered question",
        "mcma": "Add a multiple choice, multiple answer question",
        "mcoa": "Add a multiple choice, ordered answer question"
    })
    const labels = React.useRef({
        "oa":"Ordered answers", 
        "txt": "Possible answers",
        "mcma": "Answer options",
        "mcoa": "Answer options"
    }
    )
    React.useEffect(()=>{
        if(question == '' || !addable){
            saveable && setSaveable(false)
        }else{
            !saveable && setSaveable(true)
        }
    },[question, answers])

    return(
        <div class="formbox bg-light">
            <h5>{addHeaders.current[type]}</h5>
            <form>
                <QuestionField question={question} setQuestion={setQuestion} />
                
                <hr />
                <div class='form-group wrapper-title mb-2 '>
                    <label for="question">{labels.current[type] }</label>

                    {
                        type == "oa" ? <ol class="oaol">
                        {
                            answers.map((b,i)=>{
                                return(
                                    
                                        <OAFormAnswer a={b} setAnswers={setAnswers}  answers={answers} setAddable={setAddable} index={i} type="oa"/>
                                
                                    
                                )
                            })
                        }
                        </ol>:
                        type == "txt" ? <div class="txtanswrap">
                        {
                            answers.map((b,i)=>{
                                return(
                                    
                                        <TXTFormAnswer a={b} setAnswers={setAnswers}  answers={answers} setAddable={setAddable} index={i} type="txt"/>
                                
                                    
                                )
                            })
                        }
                        </div>:<div class="mcanswrap">
                        {
                            answers.map((b,i)=>{
                                return(
                                    
                                        <MCFormAnswer a={b} setAnswers={setAnswers}  answers={answers} setAddable={setAddable} index={i} type={type}/>
                                
                                    
                                )
                            })
                        }
                        </div>

                    }
                    
                    
                    {
                        addable && <div>
                        <btn onClick={()=>addOption(answers, setAnswers, type, setAddable)}class="btn addmore btn-white  txt-sm me-1">Add +</btn>
                        </div>
                    }
                    
                    <hr />
                    <div class="mt-2">
                        <btn disabled={!saveable} onClick={()=>{saveThisQuestion(question, answers, setCurrentEdit)}}class="btn-sm btn btn-primary me-1">Save</btn>
                        <btn onClick={()=>{setCurrentEdit(null)}} class="btn-sm btn btn-secondary">Cancel</btn>
                    </div>
                </div>
                
            </form>
        </div>
    )
}


function QuestionField({question, setQuestion}){
    return(
        <div class='form-group wrapper-title mb-2'>
                    <label for="question">Question</label>
                    <input id="question" class="form-control" name="question" type="txt" value={question} onChange={e=>{setQuestion(e.target.value)}}></input>
        </div>
    )
}
// {answer:answer, is_correct, is_correct, answer_weight}
function OAFormAnswer({a, setAnswers, answers, type, setAddable, index}){
    
    return(
        <li class="oaanscontainer mb-2 ">
             <input id="question" value={a.answer} onChange={e=>updateAnswers(answers, e, setAnswers, type, a.answer_weight, setAddable) } class="form-control mb-2" name="question" type="txt">
            </input>
            {answers.length > 2 && <span onClick={g=>removeIndex(answers, setAnswers, index)}class="bg-danger txt-white xer">X</span>}
        </li>
    )
}
function TXTFormAnswer({a, setAnswers, answers, type, setAddable, index}){
    
    return(
        <div class="oaanscontainer mb-2 ">
             <input id="question" value={a.answer} onChange={e=>updateAnswers(answers, e, setAnswers, type, a.answer_weight, setAddable) } class="form-control mb-2" name="question" type="txt">
            </input>
            {answers.length > 1 && <span onClick={g=>removeIndex(answers, setAnswers, index)}class="bg-danger txt-white xer">X</span>}
        </div>
    )
}

function MCFormAnswer({a, setAnswers, answers, type, setAddable, index}){
    return(
        <div class="mcanscontainer bg-white mb-2">
                        <input id="question" onChange={e=>updateAnswers(answers, e, setAnswers, type, a.answer_weight, setAddable) } class="form-control mb-1" name="question" type="txt" value={a.answer}></input>
                        <input type={type == "mcma" ? "checkbox":"radio"} checked={a.is_correct == true? true: false}class="multiradio me-1" id={`r${index}`} name={`r${index}`} onChange={h=>updateAnswers(answers, h, setAnswers, type, a.answer_weight, setAddable)}></input>
                        <label for={`r${index}`} >Correct</label>
                        {answers.length > 2 && <span onClick={g=>removeIndex(answers, setAnswers, index)}class="bg-danger txt-white xer">X</span>}
                    </div>
    )
}

//update 

function updateAnswers(a, b, setAnswers, type, weight, setAddable){
        let answers = [...a]
        let addable = true
        const fieldtype = b.target.type;
        answers.forEach(a=>{
            if(type == "mcoa" && fieldtype == "radio"){
                console.log("checking for correctnes")
                a.is_correct  = false;
            }
            if (a.answer_weight == weight){
                if(fieldtype == "radio"){
                    a.is_correct = true
                }else if(fieldtype == "checkbox"){
                    a.is_correct = !a.is_correct
                }
                 else{
                    a.answer = b.target.value;
                }
                    
                   
                }
            if (addable && a.answer==''){
                addable = false;
            }
                
        })
    console.log(answers)
    setAnswers(answers)
    setAddable(addable)
}


function addOption(answers, setAnswers, type, setAddable){
    let a = [...answers]
    const correcters = {
        "txt":true,
        "oa":true,
        "mcma":false,
        "mcoa":false
    }
    a.push({answer: "", is_correct: correcters[type], answer_weight: answers.length , type: type})
    setAnswers(a)
    setAddable(false)
}

function removeIndex(answers, setAnswers, index){
    let j = answers.filter((k)=>k.answer_weight != index)
    j.forEach((a,i)=>{
        a.answer_weight = i
    })
    setAnswers(j)
    
}

