let isOpen=false;
function toggleNavBar(){
    console.log("clicked");
    if(isOpen){
        isOpen=false;
        document.getElementById("header-options").classList.remove("open-nav");
        document.getElementById("header-options").classList.add("close-nav");
    }else{
        isOpen=true;
        document.getElementById("header-options").classList.remove("close-nav");
        document.getElementById("header-options").classList.add("open-nav");
    }
}
document.getElementById("nav-toggle").addEventListener("click",toggleNavBar);
document.getElementById("addBook").addEventListener("click",toggleNavBar);
document.getElementById("viewBooks").addEventListener("click",toggleNavBar);
let contractInstance=null;
let client=null;
let contractAddress="ct_TAk112LyX5GGZXzimBP36w2AzUezZJuX2YEesf62PdPfp9WMe";
let contractSource=`
contract BookLibrary=
    record bookInfo={
        name:string,
        isbn:string,
        date:string
        }
    record state={
        bookLibrarian: map(address,list(bookInfo))
        }

    stateful entrypoint init()={bookLibrarian={}}



    stateful entrypoint registerBook(name':string,isbn':string,date':string)=
        let usersListOfBooks=Map.lookup_default(Call.caller,state.bookLibrarian,[])
        let newBookInfo={name=name',isbn=isbn',date=date'}
        let newListOfBooks=newBookInfo::usersListOfBooks
        put(state{bookLibrarian[Call.caller]=newListOfBooks})

    entrypoint getUserListOfBoks()=
        Map.lookup_default(Call.caller,state.bookLibrarian,[])
`;

window.addEventListener('load',async function(){
    client=await Ae.Aepp();
    contractInstance=await client.getContractInstance(contractSource,{contractAddress});
    let allBooks=(await contractInstance.methods.getUserListOfBoks()).decodedResult;
    console.log(allBooks,"all books");
    allBooks.map(book=>{
        addBookToDom(book.name,book.isbn);
    });
    document.getElementById("loader").style.display="none";
});

async function handleSubmitBook(){
    let title=document.getElementById("input-title").value;
    let isbn=document.getElementById("input-isbn").value;
    let date=document.getElementById("input-date").value;
    if(title.trim()!=""&&isbn.trim()!=""&&date.trim()!=""){
        document.getElementById("loader").style.display="block";
        await contractInstance.methods.registerBook(title,isbn,date);
        addBookToDom(title,isbn);
        document.getElementById("loader").style.display="none";

    }
}

document.getElementById("submit-book").addEventListener("click",handleSubmitBook);

function addBookToDom(title,isbn){
    let allBooks=document.getElementById("list-books-section");

    let newBookDiv=document.createElement("div");
    newBookDiv.classList.add("book");

    let bookTitleParagraph=document.createElement("p");
    bookTitleParagraph.innerText=title;

    let bookISBNParagraph=document.createElement("p");
    bookISBNParagraph.innerText=isbn;

    newBookDiv.appendChild(bookTitleParagraph);
    newBookDiv.appendChild(bookISBNParagraph);

    allBooks.appendChild(newBookDiv);

}
