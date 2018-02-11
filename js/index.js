// Global variables ----------------------------------------------------------->>
let allMovies= {};
let allMoviesList=[];
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



  document.addEventListener("click",function(event){

    console.log(event.target.getAttribute('databaseid'));
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
      title = title.toLowerCase();

      if(title.includes(searchStr)){
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
    title : title.value,
    director: director.value,
    premiere: premiere.value,
    imdb: imdb.value,
    description: description.value,
    picture: picture.value
  }
  console.log(movieObj);
  firedb.ref('movies/').push(movieObj);

}
//-------------------------------------------------------------------------------





//--------------------------  Get movies from db ----------------------------->>
firedb.ref('/').once('value', function(snapshot){
  allMovies = snapshot.val().movies;
  sortMovieToList();
  renderMovies();
})
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
    div.setAttribute("databaseid",dbId)
    div.style.backgroundImage= `url(${picture})`

    div.innerHTML = `<div class="movie-info">
                      <p class="movie-title"></p>
                      <p class="movie-director"></p>
                      <p class="movie-description"></p>
                      <p class="movie-imdb"></p>
                      <p class="movie-premiere"></p>
                    </div>`

    div.getElementsByClassName("movie-title")[0].innerText = title;
    div.getElementsByClassName("movie-director")[0].innerText = director;
    div.getElementsByClassName("movie-imdb")[0].innerText = imdb;
    div.getElementsByClassName("movie-description")[0].innerText = description;
    div.getElementsByClassName("movie-premiere")[0].innerText = premiere;
    movieContainer.appendChild(div);
  })
}

// ---------------------------------------------------------------------------//






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
