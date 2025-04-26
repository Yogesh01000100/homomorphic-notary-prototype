from locust import HttpUser, task, between, LoadTestShape

class HomomorphicUser(HttpUser):
    host = "http://localhost:3000"
    wait_time = between(0, 0)

    @task
    def read_encrypted(self):
        self.client.get("/read-encrypted/user1", name="/read-encrypted")


class RampUpPlateauRampDown(LoadTestShape):
    """
    Based on Graph:
    - Ramp-up: 0 → 2000 users in 30 seconds
    - Plateau: Hold 2000 users for 15 seconds
    - Ramp-down: 2000 → 0 users in 60 seconds
    Total time: 105 seconds
    """
    max_users = 100
    ramp_up_time = 30
    plateau_time = 15
    ramp_down_time = 60
    total_duration = ramp_up_time + plateau_time + ramp_down_time

    def tick(self):
        run_time = self.get_run_time()

        if run_time < self.ramp_up_time:
            # Ramp-up phase
            spawn_rate = self.max_users / self.ramp_up_time
            current_users = int((run_time / self.ramp_up_time) * self.max_users)
            return (current_users, spawn_rate)

        elif run_time < self.ramp_up_time + self.plateau_time:
            # Plateau phase
            return (self.max_users, 0)

        elif run_time < self.total_duration:
            # Ramp-down phase
            elapsed = run_time - (self.ramp_up_time + self.plateau_time)
            users_left = int(self.max_users * (1 - (elapsed / self.ramp_down_time)))
            spawn_rate = self.max_users / self.ramp_down_time
            return (max(users_left, 0), spawn_rate)

        # End of test
        return None
