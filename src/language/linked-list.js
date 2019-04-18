class _Node {
    constructor(value, next){
      this.value = value;
      this.next = next; 
    }
  }
  
class LinkedList {
    constructor(){
      this.head = null;
    }
  
    insertFirst(item) {
      this.head = new _Node(item, this.head); 
    }

    insertLast(item, next=null) {
        if (this.head === null) {
          this.insertFirst(item);
        } else {
          let tempNode = this.head;
          while (tempNode.next !== null) {
            tempNode = tempNode.next; 
          }
          tempNode.next = new _Node(item, next); 
        }
    }

    remove(item) {
        if (!this.head) {
          return null; 
        }
        if (this.head.value === item) {
          this.head = this.head.next;
          return; 
        }
    
        let currNode = this.head; 
        let previousNode = this.head; 
    
        while((currNode !== null) && (currNode.value !== item)) {
          previousNode = currNode; 
          currNode = currNode.next; 
        }

        if (currNode === null) {
          return; 
        }
        previousNode.next = currNode.next; 

        return currNode.value;
    }

    find(item) {
        let currNode = this.head; 

        if (!this.head) {
          return null; 
        }

        while (currNode.value !== item) {
          if (currNode.next === null) {
            return null; 
          } else {
            currNode = currNode.next;
          }
        }

        return currNode; 
    }
   
    insertBefore(item, target){
        if(this.head == null){
            return;
        }

        if(this.head.value == target){
            this.insertFirst(item);
            return;
        }

        let tempNode = this.head;
        let prevNode = this.head;
        while(tempNode !== null && tempNode.value !== target){
          prevNode = tempNode;
          tempNode = tempNode.next;
        }
        if(tempNode === null){
          console.log('Item not found');
          return;
        }
        prevNode.next = new _Node(item, prevNode.next)
    }
  
    insertAfter(item, item2) {
      if (!this.head) {
        return null;
      }
  
      let currNode = this.head;
  
      while((currNode !== null) && (currNode.value !== item2)){
        currNode = currNode.next; 
      }
  
      if (currNode === null){
        console.log('Item not found'); 
        return; 
      }
  
      currNode.next = new _Node(item, currNode.next); 
  
    }
  
    insertAt(item, loc, list){
      let current = list.head;
      for (let i = 1; i < loc -1; i++) {
        current = current.next;
        if(current.next === null){
          this.insertLast(item);
        }
      }
      current.next = new _Node(item, current.next);
    }

}
  
  module.exports = LinkedList; 