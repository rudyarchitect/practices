<template>
  <div>
    <!-- label -->
    <label v-if="label">{{ label }}</label>
    <!-- slot -->
    <slot></slot>
    <!-- error prompt -->
    <p v-if="error">{{ error }}</p>
    <p>{{form.rules[prop]}}</p>
  </div>
</template>

<script>
export default {
  inject: ["form"],
  data() {
    return {
      error: "error info",
    };
  },
  props: {
    label: {
      type: String,
      default: "",
    },
    prop: {
      // 校验字段名称
      type: String,
    },
  },
};
</script>

<style scoped></style>
