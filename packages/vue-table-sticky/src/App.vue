<template>
  <div id="app">
    <!-- <div id="nav">
      <router-link to="/">Home</router-link> |
      <router-link to="/about">About</router-link>
    </div> -->
    <router-view/>
  </div>
</template>

<style lang="scss">
  $table-rule: 1px solid rgb(204, 204, 204);
  $table-rule--light: 1px solid rgba(155, 155, 155, 0.123);
  html {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #2c3e50;
    font-size: 90%;
  }
  table {
    border: $table-rule;
    background-color: white;
  }
  tr {
    // border: $table-rule;
  }
  th,
  td {
    padding: 0.15rem 0.25rem;
    // background-color: white;
    font-weight: normal;
    vertical-align: middle;
  }

  thead {
    // background-color: rgb(247, 247, 247);
    th {
      
      color: rgba(black, 80%);
      // border-left: $table-rule;
      font-size: small;
      text-align: center;
    }
    tr {
      &:first-child {
        th {
          font-weight: bold;
          font-size: inherit;
        }
      }
    }
  }
  tbody {
    th {
      // background-color: white;
    }
    td {
      // background-color: rgb(247, 247, 247);
      text-align: left;
      // border-right: $table-rule;
    }
    tr {
      &:nth-child(odd) {
        background-color: rgb(235, 235, 235);
      }
    }
  }
</style>
