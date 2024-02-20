const ei = JSON.parse(document.getElementById('quizitems').textContent);
const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
const IdContext = React.createContext(null)
const EditContext = React.createContext(null)
const QuestionsContext = React.createContext(null)
const UnsavedOrderContext = React.createContext(null)

function App({ id , b, quizid}){
    
    const [questions, setQuestions] = React.useState(ei)
    const [unsavedOrder, setUnsavedOrder] = React.useState(false)
    // can be mac, txt, oa
    const [editing, setEditing] = React.useState(false)
    const [qid, setQid] = React.useState(quizid)
    return(
        <UnsavedOrderContext.Provider value={[setUnsavedOrder]}>
        <QuestionsContext.Provider value={[setQuestions]}>
        <IdContext.Provider value={quizid}>
            <EditContext.Provider value={[editing, setEditing]}>
                <div clas="eqcontainer">
                    <div id="myanswers" class="mt-4">
                        {
                            questions.map((question, index, ar)=>{
                                return(<Question question={question} index={index} ar={ar}/>)
                            })
                        }
                    </div>
                    
                    <QuestionFormsApp />
                    {
                    unsavedOrder && <button onClick={()=>{saveNewOrder(setUnsavedOrder, questions, setQuestions)}} id="ordersaver" type="submit" class="btn btn-warning  fade-in-right fade ">
                    *unsaved arrangement<br/>
                    click to save
                    </button>
                    }
                    
                </div>
                
            </EditContext.Provider>
        </IdContext.Provider>
        </QuestionsContext.Provider>
        </UnsavedOrderContext.Provider>
    )
}
// question and answer display
function Question({question, index, ar}){
    const [editmode, setEditmode] = React.useState(false)
    const [setQuestions] = React.useContext(QuestionsContext)
    
    const at = React.useRef({
        oa: 'ordered answer',
        mcma: 'multiple choice, multiple answer',
        mcoa : 'multiple choice, one answer',
        txt : 'textbox answer'
    })
    const [editing, setEditing] = React.useContext(EditContext)
    if(editmode){
        return(
            <AddEditQuestion addoredit={"edit"} setCurrentEdit={setEditmode} q={question.question} type={question.quiz_type} a={[...question.answers]} questionid={question.id} questionnumber={question.question_number}/>
        )
    }else{
        return(
            <div class="questioncontainer">
                <h5>{index + 1}. {question.question} <br/></h5>
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
                    <div>
                        <btn onClick={()=>{editing? null : setEditmode(true); setEditing(true)}} class={`btn btn-secondary btn-sm editquestion me-1 ${editing && "editing"}`}>Edit</btn>
                        <btn onClick={()=>{editing? null : deleteQuestion(question.id, setEditing, setQuestions)}} class={`btn btn-danger btn-sm editquestion ${editing && "editing"}`}>Delete</btn>
                    </div>
                }

                <DownUp  index={index} ar={[...ar]}  />
               
                    
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
                <AddEditQuestion addoredit={"add"} setCurrentEdit={setCurrentEdit} q={null} type={currentEdit} a={[{possible_answer: "", is_correct: true, answer_weight: 1, type: currentEdit}]}/>
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
                <AddEditQuestion addoredit={"add"} setCurrentEdit={setCurrentEdit} q={null} type={currentEdit} a={[{possible_answer: "", is_correct: true, answer_weight: 1, type: currentEdit}, {possible_answer: "", is_correct: true, answer_weight: 2, type: currentEdit}]}/>
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
    const [setQuestions] = React.useContext(QuestionsContext)

    const addHeaders = React.useRef(
        {
        "oa":"Add an ordered answer question", 
        "txt": "Add a textbox answered question",
        "mcma": "Add a multiple choice, multiple answer question",
        "mcoa": "Add a multiple choice, one answer question"
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
                        <btn disabled={!saveable} onClick={()=>{saveable && saveThisQuestion(question, answers, setCurrentEdit, quizid, questionid, type, setEditing, setQuestions)}}class={`btn-sm btn btn-primary me-1 ${!saveable && 'editing'}`}>Save</btn>
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

function DownUp({ index, ar}){
    const [setQuestions] = React.useContext(QuestionsContext)
    const [setUnsavedOrder] = React.useContext(UnsavedOrderContext)
    return(
        <div >
            {
                index != 0 && <button onClick={()=>swapQuestionPlace("u", index, ar, setQuestions, setUnsavedOrder)} class="chevup cheverly btn btn-light mx-1 ">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" class="bi bi-chevron-double-up" viewBox="0 0 16 16">
                    <path fill-rule="evenodd" d="M7.646 2.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 3.707 2.354 9.354a.5.5 0 1 1-.708-.708l6-6z"/>
                    <path fill-rule="evenodd" d="M7.646 6.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 7.707l-5.646 5.647a.5.5 0 0 1-.708-.708l6-6z"/>
                  </svg>
                </button>
            }
        
            {
                index != ar.length -1 && <button onClick={()=>swapQuestionPlace("d", index, ar, setQuestions, setUnsavedOrder)} class="chevdown cheverly btn btn-light mx-1 ">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" class="bi bi-chevron-double-down" viewBox="0 0 16 16">
                    <path fill-rule="evenodd" d="M1.646 6.646a.5.5 0 0 1 .708 0L8 12.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
                    <path fill-rule="evenodd" d="M1.646 2.646a.5.5 0 0 1 .708 0L8 8.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
                </svg>
            </button>
            }
        
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
            if (addable && a.possible_answer==''){
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
    a.push({possible_answer: "", is_correct: correcters[type], answer_weight: answers.length +1 , type: type})
    
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
async function saveThisQuestion(question, answers, setCurrentEdit, quizid, questionid, type, setEditing,  setQuestions){
    const addoredit = questionid ? "edit" : "add";
    // shoot the all the information via post to django
    const body = {"addoredit": addoredit, "quizid": quizid, "question_id":questionid, "type":type, "question":question, "answers":answers}
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
    setQuestions(result)
    setCurrentEdit(null)
    setEditing(false)
    
}
async function deleteQuestion(id, setEditing, setQuestions){
    setEditing(true);
    const body = {"questionid":id}
    const  strfied = JSON.stringify(body)
    const request = new Request(
        '/deleteq',
        {
            method: 'POST',
            headers: {'X-CSRFToken': csrftoken},
            mode: 'same-origin', // Do not send CSRF token to another domain.
            body: strfied
        }
    )
    const response = await fetch(request)
    const res = await response.json()
    console.log("res is " + res)
    setQuestions(res)
    setEditing(false)
    
    
}
function swapQuestionPlace(direction, index, ar, setQuestions, setUnsavedOrder){
    const array = ar;
    const mover = array[index];
    let destination = null;
    if(direction == "u"){
        destination = index - 1;
    }else{
        destination = index + 1;
    }
    const temp = array[destination];
    array[destination] = mover;
    array[index] = temp;

    setQuestions(array)
    
    setUnsavedOrder(true)
}

async function saveNewOrder(setUnsavedOrder, questions, setQuestions){
    console.log('questions object : ' + questions)
    let temp = questions
    temp.forEach((a,i)=>{
        a['question_number'] = i+1
        console.log(a)
    })
    const  strfied = JSON.stringify(temp)
    const request = new Request(
        '/reorder',
        {
            method: 'POST',
            headers: {'X-CSRFToken': csrftoken},
            mode: 'same-origin', // Do not send CSRF token to another domain.
            body: strfied
        }
    )
    const response = await fetch(request)
    const res = await response.json()
    setQuestions(res)
    setUnsavedOrder(false)

}

