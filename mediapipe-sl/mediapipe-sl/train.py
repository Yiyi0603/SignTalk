import numpy as np
import torch as t
from model import HandModel
from torch import nn
from torch.utils.data import Dataset, DataLoader
from torch.autograd import Variable
import copy

# 定义数据集类
class HandDataset(Dataset):
    def __init__(self, label, data_path):
        self.label = label
        self.data_path = data_path
        self.data = np.load(data_path, allow_pickle=True)['data']

    def __len__(self):
        return len(self.data)

    def __getitem__(self, idx):
        xdata = t.tensor(self.data[idx])
        target = t.tensor(label.index(self.label)).long()  # 使用标签索引作为目标
        return xdata, target

# label = ["also", "attractive", "beautiful", "believe", "de", "doubt", "dream", "express", "eye", "give", "handLang", "have",
#          "many", "me", "method", "no", "only", "over", "please", "put", "say", "smile", "star", "use_accept_give", "very", "watch", "you"]


# label = ["bad", "foolish", "good","hate","iloveyou","me","you",]
# label = ["bad", "dream","good", "happy", "hate","home","hui","iloveyou","lei", "me","mood","no","renshi","smile",
# "think","very","watch","you",
# ]t4

# label = ["bad", "dream","good","hate","hui","iloveyou", "me","no","smile",
# "think","very","watch","you",
# ]t7

# label = ["bad", "dream","good","hate","hui","iloveyou","me","no",
# "think","watch","you",
# ]t8
label = ["bad", "dream","good","smile","hui","iloveyou","me","no",
"think","watch","you",
]


label_num = len(label)

lr = 1e-3  # learning rate
model_saved = 'checkpoints/model_t9'

# 模型定义
model = HandModel()
optimizer = t.optim.Adam(model.parameters(), lr=lr)
criterion = nn.CrossEntropyLoss()

epochs = 40
batch_size = 1  # 根据需要调整批次大小

for epoch in range(epochs):
    print("epoch:" + str(epoch))
    count = 0
    allnum = 0

    for i in range(len(label)):
        dataset = HandDataset(label[i], './npz_files/' + label[i] + ".npz")
        dataloader = DataLoader(dataset, batch_size=batch_size, shuffle=True)

        for xdata, target in dataloader:
            optimizer.zero_grad()
            input_ = Variable(xdata)
            target = Variable(target)

            output = model(input_)
            loss = criterion(output, target)
            loss.backward()
            optimizer.step()

            # 计算准确率
            _, predicted = t.max(output, 1)
            count += (predicted == target).sum().item()
            allnum += target.size(0)

    print("correct_rate:", str(count / allnum))

    t.save(model.state_dict(), '%s_%s.pth' % (model_saved, epoch))