
const API_URL = `https://node-js-voting-app-api.herokuapp.com`;


console.log('client js');
const listOfVidsElm = document.getElementById('listOfRequests');
 const SUPER_USER_ID='5fb59e0de763e7037c90bbbb';
 const state={
     sortBy:'newFirst',
     searchTerm:'',
     filterBy:'all',
     userId:'',
     isSuperUser:false
 }

function renderSingleVidReq (vidInfo , isPrepend=false){
   // console.log(vidInfo);
   
        const vidReqContainerElm = document.createElement('div');
        vidReqContainerElm.innerHTML = `${
             state.isSuperUser ?
              `<div class="card mb-3">
                <div class="card-header d-flex justify-content-between">
                    <select id="admin_change_status_${vidInfo._id}">
                        <option value="new">new</option>
                        <option value="planned">planned</option>
                        <option value="done">done</option>
                    </select>
                <div class="input-group ml-2 mr-5
                       ${vidInfo.status !=='done'?'d-none':''}
                      " id="admin_video_res_container_${vidInfo._id}">
                    <input 
                       type="text" 
                       class="form-control"  
                       placeholder="paste here youtube video id"
                       id="admin_video_res_${vidInfo._id}"   
                    >
                    <div class="input-group-append">
                    <button 
                        id="admin_save_video_res_${vidInfo._id}"
                        class="btn btn-outline-secondary"              
                        type="button">Save</button>
                    </div>
                </div>
                <button class='btn btn-danger' id="admin_delete_video_req_${vidInfo._id}">delete</button>
                </div>`:''}
                  <div class="card-body border d-flex justify-content-between flex-row">
                      <div class="d-flex flex-column">
                      <h3>${vidInfo.topic_title}</h3>
                      <p class="text-muted mb-2"> ${vidInfo.topic_details} </p>
                      <p class="mb-0 text-muted">
   
                         ${ vidInfo.expected_result && `<strong>Expected results:</strong> ${vidInfo.expected_result} `  }
                      </p>
                      </div>
                      
                      ${  vidInfo.status==='done'? `<div class="ml-auto mr-3">
                        <iframe
                            width="250" 
                            height="135"
                            src="${vidInfo.video_ref.link}"
                            frameborder="0"
                            allowfullscreen
                            >
                        </iframe>
                        </div>`:''}

                      <div class="d-flex flex-column text-center">
                        <a id="votes_ups_${vidInfo._id}" class="btn btn-link">🔺</a>
                        <h3 id="score_vote_${vidInfo._id}"> ${vidInfo.votes.ups.length - vidInfo.votes.downs.length} </h3>
                        <a id="votes_downs_${vidInfo._id}" class="btn btn-link">🔻</a>
                      </div>
                  </div>
                  <div class="card-footer d-flex flex-row justify-content-between">
                      <div class="
                      ${vidInfo.status==='done'?
                      "text-success":vidInfo.status==='planned'?
                      "text-primary":''
                    }">
                      <span>
                      ${vidInfo.status.toUpperCase()}
                      ${vidInfo.status==='done'?`done on  ${new Date(vidInfo.submit_date).toLocaleDateString()}`:"" }
                      </span>
                      &bullet; added by <strong> ${vidInfo.author_name} </strong> on
                      <strong> ${new Date(vidInfo.submit_date).toLocaleDateString()} </strong>
                      </div>
                      <div
                      class="d-flex justify-content-center flex-column 408ml-auto mr-2"
                      >
                      <div class="badge badge-success">
                         ${vidInfo.target_level}
                      </div>
                      </div>
                  </div>
                  </div>
          `;
        //   vidReqContainerElm.innerHTML += videReqTemplate;
        if(isPrepend){
            listOfVidsElm.prepend(vidReqContainerElm);
        }else{
            listOfVidsElm.appendChild(vidReqContainerElm);
        }
     const adminChangeStatusElm =document.getElementById(`admin_change_status_${vidInfo._id}`); 
     const adminVideoResElm =document.getElementById(`admin_video_res_${vidInfo._id}`);
     const adminSaveVidResElm =document.getElementById(`admin_save_video_res_${vidInfo._id}`);
     const adminVideoResContainer=document.getElementById(`admin_video_res_container_${vidInfo._id}`);
     const adminDeleteVidReqElm =document.getElementById(`admin_delete_video_req_${vidInfo._id}`);
     if(state.isSuperUser){

        adminChangeStatusElm.value=vidInfo.status;
        adminVideoResElm.value=vidInfo.video_ref.link;
        adminChangeStatusElm.addEventListener('change', e => {
            if(e.target.value === 'done'){
               adminVideoResContainer.classList.remove('d-none');
            }else{
                  updateVideoStatus(vidInfo._id,e.target.value,);
            }
           });
   
           
           adminSaveVidResElm.addEventListener('click', e => {
               e.preventDefault();
               if(!adminVideoResElm.value){
                   adminVideoResElm.classList.add('is-invalid');
                   adminVideoResElm.addEventListener('input', e =>{
                       adminVideoResElm.classList.remove('is-invalid');
                   });
                   return;
               }   
               updateVideoStatus(vidInfo._id,'done', adminVideoResElm.value );
           });
                 
           adminDeleteVidReqElm.addEventListener('click', e =>{
               const isSure = confirm(`are you sure you want to delete this ${vidInfo.topic_title}`);
                if(!isSure) return ;
               e.preventDefault();
               fetch(`${API_URL}/video-request`,{
                   method:'DELETE',
                   headers: {
                       Accept: "application/json",
                       "Content-Type": "application/json"
                       },
                       body:JSON.stringify({  id:vidInfo._id })
                   })
                   .then(res=>res.json())
                   .then(data=> window.location.reload());          
           });   
     }
    

       

        
        const scoreVotesElm = document.getElementById(`score_vote_${vidInfo._id}`);
        const voteElms = document.querySelectorAll(`[id^=votes_][id$=_${vidInfo._id}]`);
        applyVoteStyle(vidInfo._id , vidInfo.votes, vidInfo.status==='done');
       // console.log(voteElms);
        voteElms.forEach(elm => {

             elm.addEventListener('click', e => {
                 e.preventDefault();
                 //console.log('super user');
                 const [ , vote_type, id] = e.target.getAttribute('id').split('_');
                 
                 fetch(`${API_URL}/video-request/vote`,{
                    method:'PUT',
                    headers: {
                            Accept: "application/json",
                            "Content-Type": "application/json"
                        },
                    body:JSON.stringify({id, vote_type, user_id :state.userId}),
                })
                .then(bolb => bolb.json())
                .then(data => {
                    scoreVotesElm.innerText = data.ups.length - data.downs.length;
                    applyVoteStyle( id , data , vidInfo.status==='done' , vote_type );
                });
               });
        });       
}

function applyVoteStyle( video_id , votes_list , isDisabled , vote_type){
        const voteUpsElm = document.getElementById(`votes_ups_${video_id}`);
        const voteDownsElm =document.getElementById(`votes_downs_${video_id}`);
        if(isDisabled){
            voteUpsElm.style.opacity='0.5';
            voteUpsElm.style.cursor='not-allowed';    
            voteDownsElm.style.opacity='0.5';
            voteDownsElm.style.cursor='not-allowed';
            return;
        }
        if(!vote_type){
            if(votes_list.ups.includes(state.userId)){
              vote_type='ups';
            }else if(votes_list.downs.includes(state.userId)){
              vote_type='downs';
            }else{
                return;
            }
        }  
       
        const voteDirElm = vote_type === 'ups' ? voteUpsElm : voteDownsElm;
        const otherDirElm = vote_type === 'ups' ? voteDownsElm : voteUpsElm;
        if(votes_list[vote_type].includes(state.userId)){
            voteDirElm.style.opacity=1;
            otherDirElm.style.opacity='0.5';
            //console.log(otherDirElm);
        }else{
            otherDirElm.style.opacity=1;
        }
}

function updateVideoStatus( id , status , resVideo = ''  ){
    fetch(`${API_URL}/video-request`,{
        method:'PUT',
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
            },
            body:JSON.stringify({  id,  status, resVideo })
        })
        .then(res=>res.json())
        .then(data=> window.location.reload()); 
}


function loadAllVidReqs( sortBy = 'newFirst' , searchTerm = '' , filterBy = 'all' ){
    //   show list of video requests
   
    fetch(`${API_URL}/video-request?sortBy=${sortBy}&searchTerm=${searchTerm}&filterBy=${filterBy}`)
    .then( bolb => bolb.json())
    .then( (data) => {
        listOfVidsElm.innerHTML='';
        data.forEach(vidInfo => {
           renderSingleVidReq(vidInfo);
        });
    });
}

function debounce(fn , time){
  let timeout;
    return function(...args){
        clearTimeout(timeout);
         // connect "this" of setTimeout with "this" of the event call back
         timeout = setTimeout(fn.apply(this,args),time);
    }
}



document.addEventListener('DOMContentLoaded', function(){
    const formVidReqElm = document.getElementById('formVideoRequest');
    const sortByElms = document.querySelectorAll('[id*=sort_by_]');
    const filterByElms= document.querySelectorAll('[id^=filter_by_]');
    const searchBoxElm = document.getElementById('search_box');
    const formLoginElm =document.querySelector('.form-login');
    const appContentElm = document.querySelector('.app-content');

    if(window.location.search){
         state.userId =  new URLSearchParams(window.location.search).get('id');
         if(state.userId === SUPER_USER_ID){
             state.isSuperUser=true;
             document.querySelector('.normal-user-content').classList.add('d-none');
         }
         formLoginElm.classList.add('d-none');
         appContentElm.classList.remove('d-none');
    }
    // console.log(state);
    loadAllVidReqs(state.sortBy,state.searchTerm,state.filterBy);

    filterByElms.forEach(elm=>{
         elm.addEventListener('click', function(e) {
            state.filterBy = e.target.getAttribute('id').split('_')[2];
            
            loadAllVidReqs(state.sortBy , state.searchTerm,state.filterBy);
            filterByElms.forEach(option => option.classList.remove('active'));
            this.classList.add('active');
            console.log(this);
         });
    });

    sortByElms.forEach( elm => {
        elm.addEventListener('click', function(e){
            e.preventDefault();
             state.sortBy = this.querySelector('input').value;   
           //  console.log(state);     
             loadAllVidReqs(state.sortBy,state.searchTerm);
             this.classList.add('active');
            if(state.sortBy==='topVotedFirst'){
                document.getElementById('sort_by_new').classList.remove('active');
            }else{
                document.getElementById('sort_by_top').classList.remove('active');
            }
        });
    });

    searchBoxElm.addEventListener('input', 
     debounce( function(e) {  
        state.searchTerm = e.target.value; 
      //  console.log(this);
        loadAllVidReqs(state.sortBy,state.searchTerm,state.filterBy);
       },300) 
    );



 function checkValidity(formData){
    // const name  = formData.get('author_name');
    // const email = formData.get('author_email');
    const topic = formData.get('topic_title');
    const topicDetails = formData.get('topic_details');
     
   
    // if(!name){
    //     document.querySelector('[name=author_name]').classList.add('is-invalid');
    // }
    //  const emailPattern = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    // if(!email || !emailPattern.test(email)){
    //     document.querySelector('[name=author_email]').classList.add('is-invalid');
    // }

    if(!topic || topic.length > 30){
        document.querySelector('[name=topic_title]').classList.add('is-invalid');
    }
    if(!topicDetails){  
        document.querySelector('[name=topic_details]').classList.add('is-invalid');
    }
    
    const allInvalidElms = document
                            .getElementById('formVideoRequest')
                            .querySelectorAll('.is-invalid');

    if(allInvalidElms.length){
        allInvalidElms.forEach(elm=>{
            elm.addEventListener('input', function(e){
             // console.log(this);
              this.classList.remove('is-invalid');
            });
        });
        return false;
    }  
   return true;
 }

    // video post request
    formVidReqElm.addEventListener('submit' , (e) => {
      e.preventDefault();
      const formData = new FormData(formVidReqElm);
      formData.append('author_id',state.userId);
      const isValid = checkValidity(formData);
      if(!isValid) return;

      fetch(`${API_URL}/video-request`,{
        method:'POST',
        body:formData,
      }).then(bolb => bolb.json())
       .then( (data) => {
        // console.log(data);
        renderSingleVidReq(data,true);
       });

    });
   });