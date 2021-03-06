// Global variables ----------------------------------------------------------->>
let allMoviesOrginList=[];
let allMoviesList=[];
let allMoviesListAllPages = [];
let startAtMovies = 1;
let endAtMovies = 6;
let showMovies = endAtMovies;
let pageNumber = 1;
let sortBy = "title";
let sortReverse = false;
let isSortStrUsed= false;
let isEditAble = false;
// ---------------------------------------------------------------------------//



// ------------------------- WINDOW LOAD ------------------------------------->>

window.addEventListener("load",function(event){
  getMovieFromDbFirstTime(); // pust all movies to the page


  let inputSearch = document.getElementById('input-search');
  loadInputSearch(inputSearch);

  let btnSaveToDb =  document.getElementById('btn-SaveToDb');
  btnSaveToDb.addEventListener('click', function(event){
    saveToDatabase();
  })


  let btnSortTitle = document.getElementById('btn-sortTitle');
  btnSortTitle.addEventListener('click',function(event){
    sortBy ="title";
    configSort(btnSortTitle,"Title");
    updateDom();
  })


  let btnSortDirector = document.getElementById('btn-sortDirector');
  btnSortDirector.addEventListener('click',function(event){
    sortBy ="director";
    configSort(btnSortDirector,"Director");
    updateDom();
  })

  let btnSortPremiere = document.getElementById('btn-sortPremiere');
  btnSortPremiere.addEventListener('click',function(event){
    sortBy ="premiere";
    configSort(btnSortPremiere,"Premiere");
    updateDom();
  })

  let btnShowNext = document.getElementById('btn-next');
  btnShowNext.addEventListener('click',function(event){
    pageNumber= Number(pageNumber)+ 1;
    updateDom();
  })

  let btnShowPrevious = document.getElementById('btn-previous');
  btnShowPrevious.addEventListener('click',function(event){

    if(pageNumber!=1){
      pageNumber-=1;
    }
    if(pageNumber<1){
      pageNumber=1;
    }
    updateDom();
  })

  document.addEventListener("click",function(event){
    if(event.target.className== "movie-btn-remove"){
      let dbid = event.target.getAttribute('databaseid');
      if(isEditAble){
        removeMovie(dbid);
      }
      updateDom();
    }
  })


  document.getElementById('btn-for-editable').addEventListener("click",function(event){
    isEditAble = !isEditAble
    if(isEditAble){
      event.target.className="active";
    }else{
      event.target.className="";
    }
    updateDom();
  })

  document.getElementById('btn-show-form').addEventListener("click",function(event){

    let addMovieUserForm = document.getElementsByClassName("addMovieUserForm")[0];
    if(document.getElementsByClassName("addMovieUserForm")[0].style.display == "flex"){
      addMovieUserForm.style.display= "none";
      document.getElementById('btn-show-form').innerText="Add Movie";
    }else{
      addMovieUserForm.style.display= "flex";
      document.getElementById('btn-show-form').innerText="Close";
    }

  })

  setupDbListener();

});
//---- windows load end-------------------------------------------------------//





// --------------------- SEARCH LISTENER-------------------------------------->>


let loadInputSearch=(target)=>{
  target.addEventListener("input",(event)=>{
    searchStrConfig(event);
  })
}

let searchStrConfig=(event)=>{
  let searchStr = event.target.value;
  if(searchStr==""){
    allMoviesList= []; //reset the string search
    allMoviesList = allMoviesOrginList.map(x=>x);
    //renderMovies();
    isSortStrUsed=false;
  }else{
    isSortStrUsed=true;
  }
  updateDom();
}

let searchByStr=()=>{
  let searchStr = document.getElementById('input-search').value;

  searchStr = searchStr.toLowerCase();
  allMoviesList = allMoviesOrginList.filter(item=>{
    let title = item.title;
    let director = item.director;
    let imdb = item.imdb;
    title = title.toLowerCase();
    director = director.toLowerCase();


    if (!isNaN(searchStr)){  // for imdb search
      if(searchStr<imdb){
        return item

      }
    }else if (title.includes(searchStr) || director.includes(searchStr)) { //for titel and director search
      return item;
    }
    //document.getElementById('footer').style.display="none";

  })
  // sort the movies by current used method.
  let sortList=(a,b)=>{
    if(a[sortBy] > b[sortBy]){
      return 1
    }else if (a[sortBy] < b[sortBy]) {
      return -1
    }else{
      return 0
    }
  }


  allMoviesList = allMoviesList.sort(sortList);
  allMoviesListAllPages = allMoviesList;
}

// ---------------------------------------------------------------------------//





// ---------------------  SAVE MOVIE TO DB ----------------------------------->>
let saveToDatabase=()=>{
  let title = document.getElementsByClassName('form-title')[0];
  let director = document.getElementsByClassName('form-director')[0];
  let premiere = document.getElementsByClassName('form-premiere')[0];
  let imdb = document.getElementsByClassName('form-imdb')[0];
  let description = document.getElementsByClassName('form-description')[0];
  let picture = document.getElementsByClassName('form-picture')[0];


  let test = true;

  let testStr = (target,str,image)=>{
    if(target.value==""){
      target.style.color = "red";
      target.value="Missing " + str
      setTimeout(function () {
        target.style.color = "black";
        target.value=""
      }, 2000);
      test = false;
    }else{
      if(image){
        let str = target.value;
        if(str.includes(".jpg") || str.includes(".jpeg") || str.includes(".png")){
          //test passed
        }else{
          test = false;
          target.style.color = "red";
          target.value="Not a valid picture (jpg,jpeg or png)"
          setTimeout(function (){
            target.value= str;
            target.style.color = "black";
          },2000);
        }
      }

    }
  }

  testStr(title,"title!");
  testStr(director,"director.");
  testStr(premiere, "year!");
  testStr(imdb,"rating!");
  testStr(description,"description!");
  testStr(picture,"picture!",true);



  let movieObj = {
    title : String(title.value),
    director: String(director.value),
    premiere: String(premiere.value),
    imdb: String(imdb.value),
    description: String(description.value),
    picture: String(picture.value)
  }

  if(test){
    firedb.ref('movies/').push(movieObj);
    document.getElementsByClassName('popUpMsg')[0].innerText="Movie added";
    setTimeout(function () {
        document.getElementsByClassName('popUpMsg')[0].innerText="";
    }, 2000);

    title.value ="";
    director.value ="";
    premiere.value ="";
    imdb.value ="";
    description.value ="";
    picture.value ="";

  }

}
//-------------------------------------------------------------------------------



// ---------------------  Load filtred movies to html doome------------------->>

let renderMovies = ()=>{
  let movieContainer = document.getElementsByClassName("movie-container")[0];
  movieContainer.innerText="";
  allMoviesList.map(item=>{
    let picture = item.picture
    let title = item.title
    let description = item.description
    let imdb = item.imdb
    let director = item.director
    let premiere = item.premiere
    let dbId = item.databaseid   // databaseid is added after we got the entire list from firebase in function below "sortMovieToList"

    let div = document.createElement("div");
    div.className="movie";
    div.style.backgroundImage= `url(${picture})`

    div.innerHTML = `<div class="movie-info">
                      <p class="movie-title"></p>
                      <p class="movie-director"></p>
                      <p class="movie-imdb"></p>
                      <p class="movie-premiere"></p>
                       <span>Description: </span>
                      <p class="movie-description"></p>
                      <button class="movie-btn-remove">Delete</button>

                    </div>`

    let elementTitle = div.getElementsByClassName("movie-title")[0];
    handleMovie(elementTitle,title,dbId,"title");

    let elementDirector = div.getElementsByClassName("movie-director")[0];
    handleMovie(elementDirector,director,dbId,"director")

    let elementImdb = div.getElementsByClassName("movie-imdb")[0];
    handleMovie(elementImdb,imdb,dbId,"imdb");

    let elementDescription = div.getElementsByClassName("movie-description")[0];
    handleMovie(elementDescription,description,dbId,"description");

    let elementPremiere = div.getElementsByClassName("movie-premiere")[0];
    handleMovie(elementPremiere,premiere,dbId,"premiere")

    div.getElementsByClassName("movie-btn-remove")[0].setAttribute("databaseid",dbId)

    movieContainer.appendChild(div);
  })
}

// ---------------------------------------------------------------------------//




//----------------------- Handle Every movie one by one and add listener------>>
let handleMovie=(target,str,dbId,path)=>{
  target.innerText = str
  target.setAttribute("contenteditable",isEditAble);
  target.addEventListener("keypress",function(event){

    if(event.keyCode=="13"){
      event.preventDefault();
      firedb.ref(`movies/${dbId}/${path}`).set(target.innerText).then(function(e){
        document.getElementsByClassName('popUpMsg')[0].innerText="Database updated";
        setTimeout(function () {
            document.getElementsByClassName('popUpMsg')[0].innerText="";
        }, 2000);
      });
    }else if(event.keyCode=="10"){ // ctrl + Enter -> insert enter
      target.innerText+= "\n"
    }
  })
}
// ---------------------------------------------------------------------------//




//-------------------------Offline sort metod -------------------------------->>
let sortMovieToList=(sortBy)=>{

  if(isSortStrUsed){
    searchByStr();
  }else{
    allMoviesList= [];
    allMoviesList = allMoviesOrginList.map(x=>x);

  }

  let sortList=(a,b)=>{
    if(a[sortBy] > b[sortBy]){
      return 1
    }else if (a[sortBy] < b[sortBy]) {
      return -1
    }else{
      return 0
    }
  }

  if(sortBy!="first"){
    allMoviesList = allMoviesList.sort(sortList);
  }
}
//----------------------------------------------------------------------------//



//---------------------- setting up pages ------------------------------------>>

let showPages=()=>{
    let totalPageNumber = 0;
    let movieTotal = 0;
  if(isSortStrUsed){
     totalPageNumber = allMoviesList.length/ showMovies
     movieTotal = allMoviesList.length
  }else{
     totalPageNumber = allMoviesOrginList.length/ showMovies
     movieTotal = allMoviesList.length
  }

  if(totalPageNumber<1){
    totalPageNumber=1;
  }
  // show current page movies
  totalPageNumber = Math.ceil(totalPageNumber)
  if(pageNumber>totalPageNumber){
    pageNumber-=1;
  }

  let endPoss = endAtMovies*pageNumber;
  let startPoss = endPoss-showMovies;

  if(endPoss>movieTotal){
    endPoss = movieTotal;
    startPoss = movieTotal-showMovies;
    startPoss = endAtMovies*(pageNumber-1)
  }
  allMoviesList = allMoviesList.slice(startPoss,endPoss);


}

//----------------------------------------------------------------------------//





//--------------------- SORT BUTTONS > CHANGE TEXT --------------------------->>

let configSort = (target,sortBy)=>{

  document.getElementById('btn-sortTitle').className="";
  document.getElementById('btn-sortDirector').className="";
  document.getElementById('btn-sortPremiere').className="";

  target.className="active"

  if (target.innerHTML.includes("fa-arrow-alt-circle-down")){
    sortReverse = false;
    target.innerHTML =`${sortBy} <i class="fas fa-arrow-alt-circle-up"></i>`;
  }else{
    allMoviesList.reverse();
    sortReverse = true;
    target.innerHTML =`${sortBy} <i class="fas fa-arrow-alt-circle-down">`;

  }

}
//----------------------------------------------------------------------------//




//------------------------ REMOVE MOVIE -------------------------------------->>
removeMovie=(dbid)=>{
  firedb.ref(`/movies/${dbid}`).remove();
}
//----------------------------------------------------------------------------//





// ----------------------- PAGINATION ---------------------------------------->>
let paginationSetup=()=>{
  let totalPageNumber = 0;
  if(isSortStrUsed){
    totalPageNumber = allMoviesListAllPages.length/ showMovies
  }else{
    totalPageNumber = allMoviesOrginList.length/ showMovies
  }

  totalPageNumber = Math.ceil(totalPageNumber)
  let paginationList = document.getElementById('pagination');
  if(paginationList.innerText!=""){
    paginationList.innerHTML = "";
  }

  for(let i = 1; i<=totalPageNumber; i++){
    let li = document.createElement("li");
    let a = document.createElement("a");
    a.className = ("paginationList");
    a.setAttribute("href","#")
    a.innerText = i;
    paginationSetupAddEventListener(a);
    li.appendChild(a);
    paginationList.appendChild(li)
  }
  paginationMark(); //markes the current page
}


let paginationSetupAddEventListener = (target) =>{
  target.addEventListener('click', function(event){
    event.preventDefault();
    event.stopPropagation();
    pageNumber = target.innerText;
    sortMovieToList(sortBy);
    showPages();
    renderMovies();
    paginationMark();
  })
}
//----------------------------------------------------------------------------//



//----------------------- MARK CURRENT PAGE IN PAGINATION -------------------->>
let paginationMark=()=>{
  let paginationList = document.getElementById('pagination');
  children = paginationList.children;

  for(let i = 0; i < children.length; i++){
    if(i == pageNumber-1){
          paginationList.children[i].className="active";
    }else{
      paginationList.children[i].className="";
    }
  }
  //console.log("sid nummer är: ",pageNumber);
}

//----------------------------------------------------------------------------//






//--------------------------  Get movies from db on Start--------------------->>
let getMovieFromDbFirstTime = ()=>{
  firedb.ref('movies/').once('value', function(snapshot){
    allMoviesInDb = snapshot.val();

    for(let item in allMoviesInDb){
      allMoviesInDb[item].databaseid= item;  //added to have the right referens from firebase.
      allMoviesOrginList.push(allMoviesInDb[item])
    }

    updateDom();
  })
}

//----------- -----------------------------------------------------------------//



//-------------------Firebase child added / changed / removed ---------------->>

let setupDbListener= ()=>{
  let first = true;
  firedb.ref('movies/').limitToLast(1).on('child_added',function(snapshot,prevChildKey){ //added

    if(first){
      first = false;
    }else{
      let data = snapshot.val();
      let key = snapshot.key;
      data.databaseid = key;
      allMoviesOrginList.push(data);
      updateDom();
    }
  })

  firedb.ref('movies/').on('child_changed',function(snapshot){ // changed
    let data = snapshot.val();
    let key = snapshot.key;
    data.databaseid = key;


    allMoviesOrginList.map(x=> {
      if(x.databaseid == key){
        let index = allMoviesOrginList.indexOf(x);
        allMoviesOrginList[index] = data;
        updateDom();
      }
    })

  })

  firedb.ref('movies/').on('child_removed',function(snapshot){ // removed
    //console.log("child removed");
    first=true;
    let key = snapshot.key;
    allMoviesOrginList = allMoviesOrginList.filter(item => item.databaseid!== key);
    updateDom();

  })


}

//----------------------------------------------------------------------------//


//------------------- UPDATE HTML SITE WHEN DB CHANGE------------------------->>

let updateDom=()=>{

  sortMovieToList(sortBy);
  if(sortReverse){
    allMoviesList.reverse();
  }
  showPages();        // shows current x movies on page and calculate total pages
  renderMovies();     // puts movies on page
  paginationSetup();  // puts pagination on page

}

//----------------------------------------------------------------------------//
