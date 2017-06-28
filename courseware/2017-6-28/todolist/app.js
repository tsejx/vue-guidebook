let v =  new Vue({
	el:'.todoapp',
	data:{
		arr:[
			{
				title:'多多对对',
				checked:false,
				id:0
			},
			{
				title:'呵呵呵',
				checked:false,
				id:1
			}
		],
		val:'',
		all:false
	},
	methods:{
		keyup(){
			this.arr.push({
				title:this.val,
				checked:false,
				id:+new Date
			});
			this.val = '';
			this.allFn();
		},
		click(val){
			this.arr = this.arr.filter((e)=>{
				return e.id != val.id;
			});
		},
		allFn(){
			/*
				当点击某个的时候去看看别的是否为选中状态，并且把结果给all（布尔值）
				every
			*/
			this.all = this.arr.every((e)=>e.checked);
		},
		allClick(){
			this.arr.forEach((e)=>{
					e.checked = this.all;
			});
		}
	}
});