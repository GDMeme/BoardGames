#pragma once

class Player {
    public:
        Player() {
            this->balance = 0;
        }

    private:
        int* balance;
        bool* landmarks [4] {false};
};