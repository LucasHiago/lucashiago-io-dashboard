const rollDown = () => {
        
    let list = document.querySelector('.list-inside-content');

     setTimeout(() => {
     list.scrollTo({
         top: list.scrollHeight,
         behavior: 'smooth'
     });
     }, 800);
     
 }

export default rollDown;