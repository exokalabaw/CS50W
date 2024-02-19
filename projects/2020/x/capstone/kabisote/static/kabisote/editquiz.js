const ei = JSON.parse(document.getElementById('quizitems').textContent);
const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
const IdContext = React.createContext(null)
const EditContext = React.createContext(null)
function App({ id , b, quizid}){
    
    const [questions, setQuestions] = React.useState(ei)
    // can be mac, txt, oa
    const [editing, setEditing] = React.useState(false)
    const [qid, setQid] = React.useState(quizid)
    return(
        <IdContext.Provider value={quizid}>
            <EditContext.Provider value={[editing, setEditing]}>
                <div clas="eqcontainer">
                    <div id="myanswers" class="mt-4">
                        {
                            questions.map(question=>{
                                return(<Question question={question} />)
                            })
                        }
                    </div>
                    
                    <QuestionFormsApp />
                    
                    
                </div>
            </EditContext.Provider>
        </IdContext.Provider>
    )
}
// question and answer display
function Question({question}){
    const [editmode, setEditmode] = React.useState(false)
    const at = React.useRef({
        oa: 'ordered answer',
        mcma: 'multiple choice, multiple answer',
        mcoa : 'multiple choice, multiple answer',
        txt : 'textbox answer'
    })
    const [editing, setEditing] = React.useContext(EditContext)
    if(editmode){
        return(
            <AddEditQuestion addoredit={"edit"} setCurrentEdit={setEditmode} q={question.question} type={question.quiz_type} a={[...question.answers]} questionid={question.id} questionnumber={question.question_number}/>
        )
    }else{
        return(
            <div >
                <h5>{question.question} <br/></h5>
                <small>({at.current[`${question.quiz_type}`]}, {question.points} point{question.points > 1 && "s"})</small>
                {
                    question.quiz_type == "oa"?
                                <ol class="mt-2 mb-3">
                                {
                                    question.answers.map(a=>{
                                        return(
                                            <PossibleAnswer answer={a} quiz_type={question.quiz_type}/>
                                        )
                                    })
                                }
                                </ol>
                    :
                    <ul class="mt-2 mb-3">
                    {
                        question.answers.map(a=>{
                            return(
                                <PossibleAnswer answer={a} quiz_type={question.quiz_type}/>
                            )
                        })
                    }
                    </ul>
        
    
    
                }
                {
                     <btn onClick={()=>{editing? null : setEditmode(true); setEditing(true)}} class={`btn btn-secondary btn-sm editquestion ${editing && "editing"}`}>Edit</btn>
                }
                
            </div>
        )
    }
    
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
function QuestionFormsApp(){
    const [currentEdit, setCurrentEdit] = React.useState(null)
    
    switch(currentEdit){
        case null:
            return(
                <QuestionButtons setCurrentEdit={setCurrentEdit} />
            )
        case 'txt':
            return(
                <AddEditQuestion addoredit={"add"} setCurrentEdit={setCurrentEdit} q={null} type={currentEdit} a={[{possible_answer: "", is_correct: true, answer_weight: 0, type: currentEdit}]}/>
            )
        case 'mcoa':
            return(
                <AddEditQuestion addoredit={"add"} setCurrentEdit={setCurrentEdit} type={currentEdit} a={[{possible_answer: "", is_correct: true, answer_weight: 0, type: currentEdit}, {possible_answer: "", is_correct: false, answer_weight: 1, type: currentEdit}]}/>
            )
        case 'mcma':
            return(
                <AddEditQuestion addoredit={"add"} setCurrentEdit={setCurrentEdit} type={currentEdit} a={[{possible_answer: "", is_correct: true, answer_weight: 0, type: currentEdit}, {possible_answer: "", is_correct: false, answer_weight: 1, type: currentEdit}]}/>
            )
        case 'oa':
            return(
                <AddEditQuestion addoredit={"add"} setCurrentEdit={setCurrentEdit} q={null} type={currentEdit} a={[{possible_answer: "", is_correct: true, answer_weight: 0, type: currentEdit}, {possible_answer: "", is_correct: true, answer_weight: 1, type: currentEdit}]}/>
            )
    }
    
}
function QuestionButtons({setCurrentEdit}){
    const [editing, setEditing] = React.useContext(EditContext)
    if(editing){
        return null;
    }else{
        return(
            <div id="addlinks" class="bg-light">
                    <h6>Add:</h6>
                    <button class="btn btn-secondary btn-sm me-1" onClick={()=>{setCurrentEdit('txt'); setEditing(true)}}>Textbox</button>
                    <button class="btn btn-secondary btn-sm me-1" onClick={()=>{setCurrentEdit('mcoa'); setEditing(true)}}>Multiple Choice, One Answer</button>
                    <button class="btn btn-secondary btn-sm me-1" onClick={()=>{setCurrentEdit('mcma'); setEditing(true)}}>Multiple Choice, Multiple Answer</button>
                    <button class="btn btn-secondary btn-sm me-1" onClick={()=>{setCurrentEdit('oa'); setEditing(true)}}>Ordered Answer</button>
            </div>
        )
    }
    
}

function AddEditQuestion({setCurrentEdit, q, a, type, addoredit, questionid}){
    const [question, setQuestion] = React.useState(q)
    // {answer:answer, is_correct, is_correct, answer_weight}
    const [answers, setAnswers] = React.useState(a)
    //disables add and rearrange buttons when a field is empty
    const [addable, setAddable] = React.useState(addoredit == "edit" ? true : false)
    const [saveable, setSaveable] = React.useState(false)
    const quizid = React.useContext(IdContext)
    const [editing, setEditing] = React.useContext(EditContext)
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
                {}
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
                        <btn disabled={!saveable} onClick={()=>{saveThisQuestion(question, answers, setCurrentEdit, quizid, questionid, type, setEditing)}}class="btn-sm btn btn-primary me-1">Save</btn>
                        <btn onClick={()=>{setCurrentEdit(null); setEditing(false)}} class="btn-sm btn btn-secondary">Cancel</btn>
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
             <input id="question" value={a.possible_answer} onChange={e=>updateAnswers(answers, e, setAnswers, type, a.answer_weight, setAddable) } class="form-control mb-2" name="question" type="txt">
            </input>
            {answers.length > 2 && <span onClick={g=>removeIndex(answers, setAnswers, index)}class="bg-danger txt-white xer">X</span>}
        </li>
    )
}
function TXTFormAnswer({a, setAnswers, answers, type, setAddable, index}){
    
    return(
        <div class="oaanscontainer mb-2 ">
             <input id="question" value={a.possible_answer} onChange={e=>updateAnswers(answers, e, setAnswers, type, a.answer_weight, setAddable) } class="form-control mb-2" name="question" type="txt">
            </input>
            {answers.length > 1 && <span onClick={g=>removeIndex(answers, setAnswers, index)}class="bg-danger txt-white xer">X</span>}
        </div>
    )
}

function MCFormAnswer({a, setAnswers, answers, type, setAddable, index}){
    return(
        <div class="mcanscontainer bg-white mb-2">
                        <input id="question" onChange={e=>updateAnswers(answers, e, setAnswers, type, a.answer_weight, setAddable) } class="form-control mb-1" name="question" type="txt" value={a.possible_answer}></input>
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
                a.is_correct  = false;
            }
            if (a.answer_weight == weight){
                if(fieldtype == "radio"){
                    a.is_correct = true
                }else if(fieldtype == "checkbox"){
                    a.is_correct = !a.is_correct
                }
                 else{
                    a.possible_answer = b.target.value;
                }
                    
                   
                }
            if (addable && a.answer==''){
                addable = false;
            }
                
        })
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
    a.push({possible_answer: "", is_correct: correcters[type], answer_weight: answers.length , type: type})
    console.log(a)
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

async function saveThisQuestion(question, answers, setCurrentEdit, quizid, questionid, type, setEditing, question_number){
    const addoredit = questionid ? "edit" : "add";
    // shoot the all the information via post to django
    const body = {"addoredit": addoredit, "quizid": quizid, "question_id":questionid, "type":type, "question":question, "answers":answers, "question_number":question_number}
    const strfied = JSON.stringify(body)
    const request = new Request(
        '/qe',
        {
            method: 'POST',
            headers: {'X-CSRFToken': csrftoken},
            mode: 'same-origin', // Do not send CSRF token to another domain.
            body: strfied
        }
    )
    const response = await fetch(request)
    const result = await response.json()
    console.log(result)
    setCurrentEdit(null)
    setEditing(false)
}

