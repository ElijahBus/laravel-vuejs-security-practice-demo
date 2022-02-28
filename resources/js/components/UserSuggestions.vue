<template>
    <div>
        <h4 class="text-center">User Suggestions</h4>
        <hr />
        <table class="table">
            <thead>
                <tr>
                    <th>Date created</th>
                    <th>Name</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(suggestion, index) in suggestions" :key="index">
                    <td>{{ suggestion.created_at }}</td>
                    <td>{{ suggestion.name }}</td>
                </tr>
            </tbody>
            <tbody></tbody>
        </table>
    </div>
</template>

<script>
export default {
    name: "UserSuggestions",
    data: () => {
        return {
            accessToken: null,
            suggestions: []
        }
    },
    methods: {
        getUserSuggestions() {
            axios.get('http://localhost:8000/api/admin-3rd-party/best-of-item/voted', {
                headers: {}
            })
                .then(res => {
                    console.log("-- Anonymously passed headers --");
                    console.log("User suggestions: ", res.data.data)
                    this.suggestions = res.data.data;
                })

        },

        /** Will return an access token authorizing this server to access resources */
        requestAuthorization() {
            // axios.post('http://localhost:8000/api/admin-3rd-party/login', {
            //     'user_identifier': '6737a47a435cebc8e43f'
            // }, {
            //     headers: {}
            // }).then(res => {
            //     this.getUserSuggestions();
            // })
            console.log("I am called")
        }
    },
    created() {
        this.getUserSuggestions();
    },

    async mounted() {
        console.log("*** FROM VUE - Suggestions mounted")
    }
}
</script>

<style scoped>
</style>
