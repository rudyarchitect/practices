<template>
    <div>
<slot></slot>
    </div>
</template>

<script>
    export default {
        provide(){
            return {
                // 将实例传递给后代
                form:this
            }
        },
        props:{
            model:{
                type:Object,
                require:true
            },
            rules:Object
        }
    }
</script>

<style scoped>

</style>