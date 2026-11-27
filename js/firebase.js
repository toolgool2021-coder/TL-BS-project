const config={apiKey:"AIzaSyAb2_n8alGnm2v574Yaad2e53kyyHuPaIM",authDomain:"tl-bs-5899b.firebaseapp.com",databaseURL:"https://tl-bs-5899b-default-rtdb.firebaseio.com",projectId:"tl-bs-5899b",appId:"1:300221375469:web:27c70af18744a07c223de4"};
let connection;
export function connect(){
 if(!connection) connection=(async()=>{
 const base="https://www.gstatic.com/firebasejs/12.5.0/";
 const [appSDK,authSDK,dbSDK]=await Promise.all([import(base+"firebase-app.js"),import(base+"firebase-auth.js"),import(base+"firebase-database.js")]);
 const app=appSDK.initializeApp(config),auth=authSDK.getAuth(app);
 await auth.authStateReady();
 const user=auth.currentUser || (await authSDK.signInAnonymously(auth)).user;
 return {uid:user.uid,db:dbSDK.getDatabase(app),sdk:dbSDK};
 })().catch(e=>{connection=null;throw e});
 return connection;
}
