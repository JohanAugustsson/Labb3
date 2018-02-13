// Global variables ----------------------------------------------------------->>
let allMovies= {};
let allMoviesList=[];
let endAtMovies = 3;
// ---------------------------------------------------------------------------//



// ------------------------- WINDOW LOAD ------------------------------------->>

window.addEventListener("load",function(event){
  let inputSearch = document.getElementById('input-search');
  loadInputSearch(inputSearch);

  let btnSaveToDb =  document.getElementById('btn-SaveToDb');
  btnSaveToDb.addEventListener('click', function(event){
    saveToDatabase();
  })


  let btnSortTitle = document.getElementById('btn-sortTitle');
  btnSortTitle.addEventListener('click',function(event){
    sortMovieToList("title");
    configSort(event,"Title");
  })


  let btnSortDirector = document.getElementById('btn-sortDirector');
  btnSortDirector.addEventListener('click',function(event){
    sortMovieToList("director");
    configSort(event,"Director");
  })

  let btnSortPremiere = document.getElementById('btn-sortPremiere');
  btnSortPremiere.addEventListener('click',function(event){
    sortMovieToList("premiere");
    configSort(event,"Premiere");
  })

  let btnShowNext = document.getElementById('btn-next');
  btnShowNext.addEventListener('click',function(event){

    endAtMovies+=3;
    getMovieFromDb();

  })


  document.addEventListener("click",function(event){
    if(event.target.className== "movie-btn-remove"){
      let dbid = event.target.getAttribute('databaseid');
      removeMovie(dbid);
    }
  })




}); // windows load end-------------------------------------------------------//






// --------------------- SEARCH LISTENER-------------------------------------->>


let loadInputSearch=(target)=>{

  target.addEventListener("input",(event)=>{
    sortMovieToList(); // Puts all movies to the list

    let searchStr = event.target.value;
    searchStr = searchStr.toLowerCase();
    allMoviesList = allMoviesList.filter(item=>{
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

    })

    renderMovies(); // Puts allMoviesList to html dom.

  })
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
  let movieObj = {
    title : String(title.value),
    director: String(director.value),
    premiere: String(premiere.value),
    imdb: String(imdb.value),
    description: String(description.value),
    picture: String(picture.value)
  }
  console.log(movieObj);
  firedb.ref('movies/').push(movieObj);

}
//-------------------------------------------------------------------------------






//--------------------------  Get movies from db ----------------------------->>
let getMovieFromDb = ()=>{
  firedb.ref('movies/').limitToLast(endAtMovies).on('value', function(snapshot){
    allMovies = snapshot.val();
    sortMovieToList();
    renderMovies();
  })
}
getMovieFromDb();
//----------------------------------------------------------------------------//





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
                      <button class="movie-btn-remove">x</button>
                    </div>`

    let elementTitle = div.getElementsByClassName("movie-title")[0];
    handleMovie(elementTitle,title,dbId,"title");

    //div.getElementsByClassName("movie-director")[0].innerText = director;
    let elementDirector = div.getElementsByClassName("movie-director")[0];
    handleMovie(elementDirector,director,dbId,"director")

    //div.getElementsByClassName("movie-imdb")[0].innerText = imdb;
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


let handleMovie=(target,str,dbId,path)=>{
  target.innerText = str
  target.setAttribute("contenteditable",true);
  target.addEventListener("keypress",function(event){

    if(event.keyCode=="13"){
      event.preventDefault();
      firedb.ref(`movies/${dbId}/${path}`).set(target.innerText);
    }else if(event.keyCode=="10"){ // ctrl + Enter -> insert enter
      target.innerText+= "\n"
    }
  })
}




//-------------------------Offline sort metod -------------------------------->>
let sortMovieToList=(sortBy)=>{

  allMoviesList= [];
  for(let item in allMovies){
    allMovies[item].databaseid= item;  //added to have the right referens from firebase.
    allMoviesList.push(allMovies[item])
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

  if(sortBy !== ""){ // only when user push button to sort
    allMoviesList.sort(sortList);
  }

}
//----------------------------------------------------------------------------//





//--------------------- SORT BUTTONS > CHANGE TEXT --------------------------->>

let configSort = (event,sortBy)=>{
  if (event.target.innerText == `${sortBy} A-Z`){
    renderMovies();
    event.target.innerText =`${sortBy} Z-A`;
  }else{
    allMoviesList.reverse();
    renderMovies();
    event.target.innerText =`${sortBy} A-Z`;

  }

}
//----------------------------------------------------------------------------//


//------------------------ REMOVE MOVIE -------------------------------------->>

removeMovie=(dbid)=>{
  console.log(dbid);
  firedb.ref(`/movies/${dbid}`).remove();
}




//----------------------------------------------------------------------------//
