<template>
  <div>
      <!-- 设置数据模型和校验规则 -->
    <CForm :model="model" :rules="rules">
      <CFormItem label="用户名" prop="username">
        <CInput v-model="name" placeholder="请输入名称"></CInput>
      </CFormItem>
    </CForm>
    <p>{{ name }}</p>
  </div>
</template>

<script>
import CInput from '@/components/form/CInput.vue';
import CFormItem from '@/components/form/CFormItem.vue';
import CForm from '@/components/form/CForm.vue'
export default {
  components: {
    CInput,
    CFormItem,
    CForm
  },
  data() {
    return {
      name: 'cube',
      model:{
          username:'',
          password:''
      },
      rules:{
          username:[{
              required:true,
              message:'请输入用户名称'
          }],
          password:[{
              required:true,
              message:'请输入密码'
          }]
      }
    };
  },
};
</script>

<style scoped></style>
