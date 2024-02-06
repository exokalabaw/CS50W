
function App({user, type, id}){
    const [items, setItems] = React.useState([])
    const [userid, setUserId] = React.useState(user)
    const [hasNext, setHasNext] = React.useState(false)
    const [hasPrev, setHasPrev] = React.useState(false)
    const [lastPage, setLastPage] = React.useState(null)
    const [pageNumber, setPageNumber] = React.useState(1)
    

    async function load_feed(){
        console.log('is this firing')
        let p;
        if(id){
            p = await fetch(`/j/${type}/${id}?page=${pageNumber}`)
            
        }else{
            p = await fetch(`/j/${type}?page=${pageNumber}`)
        }
        console.log('p is : '+ p)
        const i = await p.json();
        console.log(`i is ${i}`);
        setItems(i.posts)
        setHasNext(i.has_next)
        setHasPrev(i.has_previous)
        setLastPage(i.end)
    }

    React.useEffect(()=>{
        load_feed();
    },[pageNumber])

    if(items.length !=0){
        return(
            <div>
                {
                    items.map(i=>
                        <QuizItem id={id} key={i.id} stuff={i}/>
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

function QuizItem({stuff, id}){
    const [userId, setUserId] = React.useState(id)
    const [thePost, setThePost] = React.useState({
        id: stuff.id,
        owner: stuff.owner,
        username: stuff.username,
        updated: stuff.updated,
        tags: stuff.tags,
        post: stuff.description,
        title: stuff.title

    })
    console.log(thePost)
    return(
        <div class="border p-3 my-2">
            <h4><a href={`/quiz/${thePost.id}`}>{thePost.title}</a></h4>
            <small>by <a href={`/quizzes/user/${stuff.owner}`}>{thePost.username}</a></small><br/>
            <small>updated : {thePost.updated}<br/>
            <a href="">Bookmark </a>
           
            </small>
            <div class="mt-2">
                {thePost.post}
            </div>
            <small>tags: 
            {
                thePost.tags.map(t=>
                    <a class="me-2" href={`/quizzes/tag/${t.id}`} data-id={t.id}>{t.tag}</a>
                )
                }
            </small>
            <div>
            <a class="me-2" href="">Go to quiz</a>
            {
                thePost.owner == userId ? <a href="">Edit </a>:null 
            }
            </div>
            
        </div>
    )

}