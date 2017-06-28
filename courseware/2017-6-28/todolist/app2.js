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
		val:''
	},
	methods:{
		keyup(){
			this.arr.push({
				title:this.val,
				checked:false,
				id:+new Date
			});
			this.val = '';
		},
		click(val){
			this.arr = this.arr.filter((e)=>{
				return e.id != val.id;
			});
		},
		allFn(ev){
			let {checked} = ev.target;
			console.log(checked);
			this.arr.forEach((e)=>e.checked = checked);
		}
	},
	computed:{
		allChange(){
			// console.log(1);
			return this.arr.every((e)=>e.checked);
		}
	}
});