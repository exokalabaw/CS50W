
function App({user, type, id}){
    const [items, setItems] = React.useState([])
    const [userid, setUserId] = React.useState(user)
    const [hasNext, setHasNext] = React.useState(false)
    const [hasPrev, setHasPrev] = React.useState(false)
    const [lastPage, setLastPage] = React.useState(null)
    const [pageNumber, setPageNumber] = React.useState(1)
    const [loading, setLoading] = React.useState(true)
    

    async function load_feed(){
        let p;
        if(id != 'None'){
            
            p = await fetch(`/j/${type}/${id}?page=${pageNumber}`)
            
        }else{
            
            p = await fetch(`/j/${type}?page=${pageNumber}`)
        }
        const i = await p.json();
        setItems(i.posts)
        setHasNext(i.has_next)
        setHasPrev(i.has_previous)
        setLastPage(i.end)
        if(loading){
            setLoading(false)
        }
        
    }

    React.useEffect(()=>{
        load_feed();
    },[pageNumber])
    if(loading){
        return (
            <div><h5>Loading . . . </h5></div>
        )
    }
    else if(items.length !=0){
        return(
            <div>
                {
                    items.map(i=>
                        <QuizItem id={id} key={i.id} stuff={i} type={type}/>
                    )
                }
                {!hasPrev && !hasNext ? null:
                    <nav  class="text-center" >
                    <ul class="pagination justify-content-center">
                        { hasPrev ? <li class="page-item"><small class="page-link py-2" onClick={()=>setPageNumber(pageNumber - 1)}>Previous</small></li>: null}
                    
                        <li class="page-item"><small class="page-link py-1">{pageNumber} of {lastPage}</small></li>
                    { hasNext ? <li class="page-item"><small class="page-link py-2" onClick={()=>setPageNumber(pageNumber + 1)}>Next</small></li>: null}
                    </ul>
                    </nav>
                    }
                 
            </div>
        );
    }else{
        return (
            <div><h5>No items found. </h5></div>
        )
    }


}

function QuizItem({stuff, id, type}){
    const [userId, setUserId] = React.useState(id)
    const [bookmarked, setBookmarked] = React.useState(stuff.bookmarked)
    const [thePost, setThePost] = React.useState({
        id: stuff.id,
        owner: stuff.owner,
        username: stuff.username,
        updated: stuff.updated,
        tags: stuff.tags,
        post: stuff.description,
        title: stuff.title
    })
    return(
        <div class="border p-3 my-2 quizteaser">
            <h4><a href={`/quiz/${thePost.id}`}>{thePost.title}</a></h4>
            <small class="block">by <a href={`/quizzes/user/${stuff.owner}`}>{thePost.username}</a></small>
            <small class="block">updated : {thePost.updated}
            </small>
            <div class="my-3">
                {thePost.post}
            </div>
            <small class="block">category: 
            {
                thePost.tags.map(t=>
                    <a class="me-2" href={`/quizzes/tag/${t.id}`} data-id={t.id}>{t.tag}</a>
                )
                }
            </small>
            <small class="block">
                {
                type == "bookmarked"?<a a href="" onClick={(e)=>toggleBookmark(setBookmarked, bookmarked, thePost.id, e)}>{bookmarked ? "remove bookmark": "add bookmark"} </a>:<a onClick={(e)=>toggleBookmark(setBookmarked, bookmarked, thePost.id, e)}>{bookmarked ? "remove bookmark": "add bookmark"} </a>
                
                }
            </small>
            <div class="mt-3">
            <a class="me-1 btn btn-primary btn-sm " href={`/quiz/${thePost.id}`}>Go to quiz</a>
            {
                thePost.owner == userId ? <a class="btn btn-secondary btn-sm"href={`/edit/${thePost.id}`}>Edit </a>:null 
            }
            </div>
            
        </div>
    )

}
// toggle bookmarking of quiz
async function toggleBookmark(a, b, c, d){
    let bookmarked = b ? true : false;
    try {
        const response = await fetch(`/tb/${bookmarked}/${c}`)
        const j = await response.json()
        if (!response.ok || j.update == "error"){
            throw new Error(response.statusText)
        }
        a(b? false:true)
        d.preventDefault()
    }catch(error){
        alert("temporary error")
    }
    
}