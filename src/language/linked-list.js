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
        previousNode.value.next = currNode.value.next

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
  
    insertAt(nthPosition, itemToInsert) {
      if (nthPosition < 0) {
          throw new Error('Position error');
      }
      if (nthPosition === 0) {
          this.insertFirst(itemToInsert);
      } else {
          const node = this._findNthElement(nthPosition);
          const nextNode = this._findNthElement(nthPosition+1)
          const newNode = new _Node(itemToInsert, null);
        
          if(nextNode !== null){
            newNode.value.next = nextNode.value.id; 
            newNode.next = nextNode; 
            node.next = newNode;
            node.value.next = itemToInsert.id;
          } else {
            // newNode.value.next = next.next.value.id; 
            newNode.next = nextNode; 
            node.next = newNode;
            node.value.next = itemToInsert.id;
          }

      }
  }
  _findNthElement(position) {
    let node = this.head;
    if(node === null){
      return null;
    }
    for (let i=0; i<position; i++) {
        node = node.next;
    }
    return node;
  }


}
  
  module.exports = LinkedList; 