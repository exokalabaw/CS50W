window.onload = () => {
    const searchParams = new URLSearchParams(window.location.search);
    const msgCont = document.getElementById('msgcontainer');
    if(searchParams.size > 0)
    {
        if (searchParams.has('success')){
            msg = searchParams.get('success')
            msg = msg.replaceAll('-',' ');
            e = "<div id='pagealert'class='alert alert-success'>"+ msg +" <button id='xer'type='button' class='close' data-dismiss='alert' aria-label='Close'><span aria-hidden='true'>&times;</span></button></div>";
            msgCont.innerHTML = e;
        }else if(searchParams.has('error')){
            msg = searchParams.get('error')
            msg = msg.replaceAll('-',' ');
            e = "<div id='pagealert' class='alert alert-danger'>"+ msg +"<button id='xer' type='button' class='close' data-dismiss='alert' aria-label='Close'><span aria-hidden='true'>&times;</span></button></div></div>";
            msgCont.innerHTML = e;
        }
        const btnx = document.getElementById('xer')
        btnx.addEventListener("click", killalert);

    }
    const pagealert = document.getElementById('pagealert')
    function killalert(){
        pagealert.remove()
    }
    
}